import * as configController from './controllers/config.controller';

const baseUrl = async () => {
    const baseUrl = await configController.getUrl();
    return baseUrl;
}

export {baseUrl}
