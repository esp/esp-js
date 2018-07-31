import { logging } from 'esp-js';

export const _errorLog = logging.Logger.create('PolimerLogger');
export const _log = logging.Logger.create('PolimerInternalLogger');

export const logger = _log;
export const errorLogger = _errorLog;
