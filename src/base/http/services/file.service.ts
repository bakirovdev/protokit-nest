import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new Error('Logo file is required');
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }
    
    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${file.originalname.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExtension}`;
    
    // Upload to your storage
    const fileUrl = await this.uploadToStorage(file.buffer, fileName, folder);
    return fileUrl;
  }

  // Delete single file
  async deleteFile(fileUrl: string): Promise<boolean> 
  {
    try {
      // Extract file path from URL (e.g., /uploads/logos/file.jpg)
      const filePath = path.join(process.cwd(), 'public', fileUrl);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      } else {
        console.warn(`File not found: ${filePath}`);
        return false;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Delete multiple files
  async deleteFiles(fileUrls: string[]): Promise<{ 
    deleted: string[]; 
    failed: string[] 
  }> {
    const deleted: string[] = [];
    const failed: string[] = [];

    for (const fileUrl of fileUrls) {
      try {
        const success = await this.deleteFile(fileUrl);
        if (success) {
          deleted.push(fileUrl);
        } else {
          failed.push(fileUrl);
        }
      } catch (error) {
        console.error(`Failed to delete ${fileUrl}:`, error);
        failed.push(fileUrl);
      }
    }

    return { deleted, failed };
  }

  private async uploadToStorage(
    fileBuffer: Buffer,
    fileName: string,
    folder: string
  ): Promise<string> {
    return this.uploadToLocalStorage(fileBuffer, fileName, folder);
  }

  private async uploadToLocalStorage(
    fileBuffer: Buffer,
    fileName: string,
    folder: string
  ): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'public/uploads', folder);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    return `/uploads/${folder}/${fileName}`;
  }
  /**
   * Create a fake file for testing purposes
   * @param options - Optional configuration for the fake file
   * @returns A mock Express.Multer.File object
   */
  createFakeFile(options?: {
    filename?: string;
    mimetype?: string;
    size?: number;
    content?: string;
  }): Express.Multer.File {
    const defaultOptions = {
      filename: 'test-file.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 100, // 100KB
      content: 'fake file content for testing',
    };

    const config = { ...defaultOptions, ...options };

    return {
      fieldname: 'file',
      originalname: config.filename,
      encoding: '7bit',
      mimetype: config.mimetype,
      size: config.size,
      buffer: Buffer.from(config.content),
      destination: '',
      filename: config.filename,
      path: '',
      stream: null as any,
    };
  }

  createFaceFiles(count: number = 1): Express.Multer.File[]
  {
    const files: Express.Multer.File[] = [];
    for (let index = 0; index < +count; index++) {
      files.push(this.createFakeFile())      
    }
    return files;
  }
}