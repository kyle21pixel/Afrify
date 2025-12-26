import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from './storage.service';

// Define Multer file interface locally
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    return this.storageService.uploadFile(file, folder);
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload and optimize an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
        },
        width: {
          type: 'number',
        },
        height: {
          type: 'number',
        },
        quality: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Body('folder') folder?: string,
    @Body('width') width?: string,
    @Body('height') height?: string,
    @Body('quality') quality?: string,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    const options = {
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      quality: quality ? parseInt(quality, 10) : undefined,
    };

    return this.storageService.uploadImage(file, folder, options);
  }

  @Post('upload-image-variants')
  @ApiOperation({
    summary: 'Upload image with multiple size variants (original, large, medium, thumbnail)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageVariants(
    @UploadedFile() file: MulterFile,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    return this.storageService.uploadImageVariants(file, folder);
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: MulterFile[],
    @Body('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    const uploadPromises = files.map((file) =>
      this.storageService.uploadFile(file, folder),
    );

    return Promise.all(uploadPromises);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a file' })
  async deleteFile(@Body('key') key: string) {
    if (!key) {
      throw new HttpException('No file key provided', HttpStatus.BAD_REQUEST);
    }

    await this.storageService.deleteFile(key);

    return { message: 'File deleted successfully' };
  }

  @Delete('delete-multiple')
  @ApiOperation({ summary: 'Delete multiple files' })
  async deleteMultiple(@Body('keys') keys: string[]) {
    if (!keys || keys.length === 0) {
      throw new HttpException('No file keys provided', HttpStatus.BAD_REQUEST);
    }

    await this.storageService.deleteFiles(keys);

    return { message: `${keys.length} files deleted successfully` };
  }
}
