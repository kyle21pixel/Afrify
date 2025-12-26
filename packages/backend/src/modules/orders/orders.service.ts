import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { OrderStatus, FulfillmentStatus, PaymentStatus } from '@afrify/shared';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Create new order
   */
  async create(data: Partial<Order>): Promise<Order> {
    const order = this.ordersRepository.create(data);
    return this.ordersRepository.save(order);
  }

  /**
   * Create order with items
   */
  async createWithItems(
    storeId: string,
    customerId: string,
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      price: number;
    }>,
    shippingAddress: any,
    billingAddress: any,
  ): Promise<Order> {
    try {
      // Validate inventory and calculate totals
      let subtotal = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of items) {
        const product = await this.productsRepository.findOne({
          where: { id: item.productId, storeId },
        });

        if (!product) {
          throw new HttpException(
            `Product ${item.productId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }

        let variant: ProductVariant | null = null;
        let availableStock = 0;
        let itemPrice = product.price;

        if (item.variantId) {
          variant = await this.variantsRepository.findOne({
            where: { id: item.variantId, productId: item.productId },
          });

          if (!variant) {
            throw new HttpException(
              `Variant ${item.variantId} not found`,
              HttpStatus.NOT_FOUND,
            );
          }

          availableStock = variant.inventory;
          itemPrice = variant.price;
        } else {
          // For products without variants, use the first variant or default to 0
          const defaultVariant = await this.variantsRepository.findOne({
            where: { productId: product.id },
          });
          if (defaultVariant) {
            availableStock = defaultVariant.inventory;
          }
        }

        // Check inventory
        if (product.trackInventory && availableStock < item.quantity) {
          throw new HttpException(
            `Insufficient inventory for ${product.name}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const lineTotal = itemPrice * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          productId: product.id,
          variantId: variant?.id,
          quantity: item.quantity,
          price: itemPrice,
          total: lineTotal,
          productName: product.name,
          variantName: variant?.name,
        });
      }

      // Calculate taxes and shipping (simplified for now)
      const tax = subtotal * 0.075; // 7.5% VAT (Nigeria example)
      const shipping = 500; // Fixed shipping fee
      const total = subtotal + tax + shipping;

      // Create order
      const order = await this.create({
        storeId,
        customerId,
        status: OrderStatus.PENDING,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress,
        billingAddress,
        orderNumber: this.generateOrderNumber(),
      });

      // Create order items
      for (const itemData of orderItems) {
        const orderItem = this.orderItemsRepository.create({
          ...itemData,
          orderId: order.id,
        });
        await this.orderItemsRepository.save(orderItem);
      }

      this.logger.log(`Order ${order.orderNumber} created successfully`);

      return this.findOne(order.id);
    } catch (error) {
      this.logger.error('Failed to create order', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { storeId },
      relations: ['items', 'customer', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'customer', 'payment'],
    });
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    await this.ordersRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * Order State Machine Transitions
   */
  async transitionOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    const validTransitions = this.getValidTransitions(order.status);

    if (!validTransitions.includes(newStatus)) {
      throw new HttpException(
        `Cannot transition from ${order.status} to ${newStatus}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    order.status = newStatus;

    // Perform side effects based on transition
    await this.handleStatusTransition(order, newStatus);

    await this.ordersRepository.save(order);

    this.logger.log(`Order ${order.orderNumber} transitioned to ${newStatus}`);

    return order;
  }

  /**
   * Get valid state transitions
   */
  private getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.FULFILLED, OrderStatus.CANCELLED],
      [OrderStatus.FULFILLED]: [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Handle side effects of status transitions
   */
  private async handleStatusTransition(
    order: Order,
    newStatus: OrderStatus,
  ): Promise<void> {
    switch (newStatus) {
      case OrderStatus.PAID:
        // Decrement inventory
        await this.decrementInventory(order.id);
        // Send order confirmation email
        // this.notificationService.sendOrderConfirmation(order);
        break;

      case OrderStatus.PROCESSING:
        // Send processing notification
        break;

      case OrderStatus.FULFILLED:
        order.fulfillmentStatus = FulfillmentStatus.FULFILLED;
        // Send shipping notification
        break;

      case OrderStatus.DELIVERED:
        order.fulfillmentStatus = FulfillmentStatus.DELIVERED;
        order.deliveredAt = new Date();
        // Send delivery confirmation
        break;

      case OrderStatus.CANCELLED:
        // Restore inventory
        await this.restoreInventory(order.id);
        order.cancelledAt = new Date();
        break;

      case OrderStatus.RETURNED:
        // Restore inventory
        await this.restoreInventory(order.id);
        break;
    }
  }

  /**
   * Decrement inventory when order is paid
   */
  private async decrementInventory(orderId: string): Promise<void> {
    const order = await this.findOne(orderId);

    for (const item of order.items) {
      if (item.variantId) {
        await this.variantsRepository.decrement(
          { id: item.variantId },
          'inventory',
          item.quantity,
        );
      } else {
        await this.productsRepository.decrement(
          { id: item.productId },
          'inventory',
          item.quantity,
        );
      }
    }

    this.logger.log(`Inventory decremented for order ${order.orderNumber}`);
  }

  /**
   * Restore inventory when order is cancelled/returned
   */
  private async restoreInventory(orderId: string): Promise<void> {
    const order = await this.findOne(orderId);

    for (const item of order.items) {
      if (item.variantId) {
        await this.variantsRepository.increment(
          { id: item.variantId },
          'inventory',
          item.quantity,
        );
      } else {
        await this.productsRepository.increment(
          { id: item.productId },
          'inventory',
          item.quantity,
        );
      }
    }

    this.logger.log(`Inventory restored for order ${order.orderNumber}`);
  }

  /**
   * Process payment confirmation
   */
  async handlePaymentConfirmation(
    orderId: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (paymentStatus === PaymentStatus.COMPLETED) {
      return this.transitionOrderStatus(orderId, OrderStatus.PAID);
    } else if (paymentStatus === PaymentStatus.FAILED) {
      return this.transitionOrderStatus(orderId, OrderStatus.CANCELLED);
    }

    return order;
  }

  /**
   * Mark order as fulfilled
   */
  async fulfillOrder(
    orderId: string,
    trackingNumber?: string,
    carrier?: string,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (order.status !== OrderStatus.PROCESSING) {
      throw new HttpException(
        'Order must be in PROCESSING status to fulfill',
        HttpStatus.BAD_REQUEST,
      );
    }

    order.fulfillmentStatus = FulfillmentStatus.FULFILLED;
    order.trackingNumber = trackingNumber;
    order.carrier = carrier;
    order.fulfilledAt = new Date();

    await this.ordersRepository.save(order);

    return this.transitionOrderStatus(orderId, OrderStatus.FULFILLED);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (![OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING].includes(order.status)) {
      throw new HttpException(
        'Order cannot be cancelled in current status',
        HttpStatus.BAD_REQUEST,
      );
    }

    order.cancellationReason = reason;

    return this.transitionOrderStatus(orderId, OrderStatus.CANCELLED);
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
