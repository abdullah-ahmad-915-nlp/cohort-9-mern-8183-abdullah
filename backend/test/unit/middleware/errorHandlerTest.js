import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

function mockRes() {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
}

describe('errorHandler', () => {
    let originalNodeEnv;

    beforeEach(() => {
        originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
        sinon.restore();
        process.env.NODE_ENV = originalNodeEnv;
    });

    it('uses err.statusCode when it is a valid 4xx/5xx integer', async () => {
        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { statusCode: 404, message: 'Note not found' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ error: 'Note not found' })).to.be.true;
    });

    it('falls back to 500 when statusCode is missing', async () => {
        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { message: 'Something broke' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(res.status.calledWith(500)).to.be.true;
    });

    it('falls back to 500 when statusCode is not an integer', async () => {
        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { statusCode: 'not-a-number', message: 'Bad input' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(res.status.calledWith(500)).to.be.true;
    });

    it('falls back to 500 when statusCode is out of the 400-599 range', async () => {
        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { statusCode: 200, message: 'Not really an error' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(res.status.calledWith(500)).to.be.true;
    });

    it('masks the message with a generic string for 5xx errors in production', async () => {
        process.env.NODE_ENV = 'production';

        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { statusCode: 500, message: 'Leaky internal detail' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(res.json.calledWith({ error: 'Internal server error' })).to.be.true;
    });

    it('does not mask the message for 4xx errors even in production', async () => {
        process.env.NODE_ENV = 'production';

        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { statusCode: 400, message: 'Title is required' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(res.json.calledWith({ error: 'Title is required' })).to.be.true;
    });

    it('does not mask the message for 5xx errors outside production', async () => {
        process.env.NODE_ENV = 'development';

        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { statusCode: 500, message: 'Detailed dev error' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(res.json.calledWith({ error: 'Detailed dev error' })).to.be.true;
    });

    it('logs the error via the logger', async () => {
        const loggerStub = { error: sinon.stub() };
        const { default: errorHandler } = await esmock('../../../src/middleware/errorHandler.js', {
            '../../../src/config/logger.js': { default: loggerStub }
        });

        const err = { statusCode: 400, message: 'Bad request' };
        const res = mockRes();

        errorHandler(err, {}, res, sinon.stub());

        expect(loggerStub.error.calledOnce).to.be.true;
        expect(loggerStub.error.firstCall.args[0]).to.deep.equal({ err });
    });
});