import { SetMetadata } from '@nestjs/common';

export const IsPublic = 'isPublic';

export const PublicRoute = () => {
  return SetMetadata(IsPublic, true);
};
