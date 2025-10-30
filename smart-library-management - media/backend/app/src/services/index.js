import * as userServiceInternal from './userService.js';
import * as bookServiceInternal from './bookService.js';
import * as loanServiceInternal from './loanService.js';
import * as brandServiceInternal from './brandService.js';
import * as campaignServiceInternal from './campaignService.js';
import * as communicationServiceInternal from './communicationService.js';

export const userService = userServiceInternal;
export const bookService = bookServiceInternal;
export const loanService = loanServiceInternal;
export const brandService = brandServiceInternal;
export const campaignService = campaignServiceInternal;
export const communicationService = communicationServiceInternal;


export const userServiceExternal = {
  findUserById: userServiceInternal.findUserById,
  countTotalUsers: userServiceInternal.countTotalUsers,
  validateUserIdInternal: userServiceInternal.validateUserIdInternal,
};


export const bookServiceExternal = {
  findBookById: bookServiceInternal.findBookById,
  updateAvailableCopies: bookServiceInternal.updateAvailableCopies,
  getAvailableBooksCount: bookServiceInternal.getAvailableBooksCount,
  validateBookIdInternal: bookServiceInternal.validateBookIdInternal,
  getBookStatistics: bookServiceInternal.getBookStatistics,
};

export const brandServiceExternal = {
  findBrandById: brandServiceInternal.findBrandById,
  findBrandByName: brandServiceInternal.findBrandByName,
  validateBrandId: brandServiceInternal.validateBrandId,
};

export const campaignServiceExternal = {
  findCampaignById: campaignServiceInternal.findCampaignById,
  findCampaignByName: campaignServiceInternal.findCampaignByName,
  validateCampaignId: campaignServiceInternal.validateCampaignId,
};