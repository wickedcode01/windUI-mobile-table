import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';

export function isNullOrUndefined(value) {
  return isNull(value) || isUndefined(value);
}
