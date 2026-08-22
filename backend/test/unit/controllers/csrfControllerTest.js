import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

function mockRes() {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
}

describe('csrfController', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('generates a token and returns it with 200', async () => {
        const generateCsrfTokenStub = sinon.stub().returns('fake-csrf-token');

        const { getCsrfToken } = await esmock('../../../src/controllers/csrfController.js', {
            '../../../src/config/csrf.js': {
                generateCsrfToken: generateCsrfTokenStub
            }
        });

        const req = {};
        const res = mockRes();

        getCsrfToken(req, res);

        expect(generateCsrfTokenStub.calledWith(req, res)).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ csrfToken: 'fake-csrf-token' })).to.be.true;
    });
});