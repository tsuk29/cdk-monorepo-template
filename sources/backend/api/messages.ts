import wrap, { AppHandler } from './wrap';
import * as types from '../../shared/types';

const get: AppHandler<types.API['Greeting']['Response']> = async (
  event
): Promise<types.API['Greeting']['Response']> => {
  console.log('event', event);
  return {
    reply_message: 'hehehe',
  };
};

export const handler = wrap(get);
