import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

function mockRes() {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
}

describe('notFound', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('responds with 404 and a standard error message', async () => {
        const { default: notFound } = await esmock('../../../src/middleware/notFound.js');

        const res = mockRes();
        const next = sinon.stub();

        notFound({}, res, next);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ error: 'Route not found' })).to.be.true;
    });

    it('does not call next', async () => {
        const { default: notFound } = await esmock('../../../src/middleware/notFound.js');

        const res = mockRes();
        const next = sinon.stub();

        notFound({}, res, next);

        expect(next.called).to.be.false;
    });

    it('responds the same way regardless of request contents', async () => {
        const { default: notFound } = await esmock('../../../src/middleware/notFound.js');

        const req = { originalUrl: '/notes/does-not-exist', method: 'DELETE' };
        const res = mockRes();
        const next = sinon.stub();

        notFound(req, res, next);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ error: 'Route not found' })).to.be.true;
    });
});