import { Request, Response } from 'express';
import { registerIndividualSeller, registerBusinessSeller } from '../services/settlement.seller.service';
import multer from 'multer';
import { uploadBusinessLicense } from '../../middlewares/upload';
import { uploadBusinessLicenseFile } from '../services/settlement.seller.service';
import { AppError } from '../../errors/AppError';

export const registerIndividual = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    const userId = (req.user as { user_id: number }).user_id;
    const result = await registerIndividualSeller(userId, req.body);

    return res.status(200).json({
      message: result.message,
      statusCode: 200,
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
        statusCode: 400,
      });
    }

    if (error.name === 'AccountVerificationError') {
      return res.status(400).json({ error: 'AccountVerificationError', subCode: error.subCode, message: error.message, statusCode: 400 });
    }
    
    return res.status(500).json({
      error: 'InternalServerError',
      message: '서버 오류가 발생했습니다.',
      statusCode: 500,
    });
  }
};

export const uploadLicense = async (req: Request, res: Response) => {
  const uploadSingle = uploadBusinessLicense.single('file');

  uploadSingle(req, res, async (err: any) => {
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'FileTooLarge',
            message: '파일 크기는 최대 20MB까지만 허용됩니다.',
            statusCode: 413,
          });
        }
      } 
      
      if (err instanceof AppError && err.statusCode === 415) {
        return res.status(415).json({
          error: err.name, 
          message: err.message,
          statusCode: 415,
        });
      } else if (err) {
        throw err; 
      }

      const user = req.user as { user_id: number } | undefined;
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: '로그인이 필요합니다.',
          statusCode: 401,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'ValidationError',
          message: '업로드할 파일이 첨부되지 않았습니다.',
          statusCode: 400,
        });
      }

      const result = await uploadBusinessLicenseFile(user.user_id, req.file);

      return res.status(200).json({
        message: result.message,
        fileUrl: result.fileUrl,
        statusCode: 200,
      });

    } catch (error: any) {
      console.error('사업자등록증 업로드 중 에러 발생:', error);
      return res.status(500).json({
        error: 'InternalServerError',
        message: '알 수 없는 오류가 발생했습니다.',
        statusCode: 500,
      });
    }
  });
};

export const registerBusiness = async (req: Request, res: Response) => {
  try {
    const user = req.user as { user_id: number } | undefined;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
        statusCode: 401,
      });
    }

    const userId = user.user_id;
    const result = await registerBusinessSeller(userId, req.body);

    return res.status(200).json({
      message: result.message,
      statusCode: 200,
    });

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
        statusCode: 400,
      });
    }
    
    if (error.name === 'AlreadyRegistered') {
      return res.status(409).json({
        error: 'AlreadyRegistered',
        message: error.message,
        statusCode: 409,
      });
    }

    if (error.name === 'DuplicateBusinessNumber') {
      return res.status(409).json({
        error: 'DuplicateBusinessNumber',
        message: error.message,
        statusCode: 409,
      });
    }

    console.error('사업자 판매자 등록 중 에러 발생:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: '서버 오류가 발생했습니다.',
      statusCode: 500,
    });
  }
};