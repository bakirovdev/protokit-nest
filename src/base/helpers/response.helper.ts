import { HttpException, HttpStatus } from "@nestjs/common";
import { __ } from "@src/base/helpers/translator.helper";
import { AxiosError } from "axios";
import { PaginatedResult } from "./pagination.helper";

export type ApiResponseType<T = {}> = {
  data: T | T[],
  message: string
}

export type PGResponseType<T> = {
  data: T | T[]
  meta: {
    total?: number
    totalPage?: number
    page?: number
    perPage?: number
    nextPage?: boolean    
  },
  message: string
}

export class ApiResponse {

  static success<T>(data: T, message = __('messages.success')): ApiResponseType<T> {
    return {
      data,
      message
    };
  }

  static successPaginate<T>(data?: PaginatedResult<T>, message = __('messages.success')): PGResponseType<T> {
    return {
      data: data?.data || [],
      meta: data?.meta || {
          total: 0,
          nextPage: false,
          perPage: 10,
          page: 1,
          totalPage: 0
        },
      message
    }
  }

  static error(error: any, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    if (error instanceof HttpException) {
      throw error;
    }
    
    // If it's an AxiosError, handle it
    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as { message?: string } | undefined;
      
      throw new HttpException(
        {
          message: responseData?.message || axiosError.message || __('messages.axios_error'),
          errors: axiosError.response?.data || null,
        },
        axiosError.response?.status || status,
      );
    }
    
    // Handle other types of errors
    throw new HttpException(
      {
        message: error.message || __('messages.error'),
        errors: null,
      },
      status,
    );
  }
}