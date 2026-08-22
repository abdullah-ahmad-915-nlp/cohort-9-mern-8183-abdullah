import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

function mockRes() {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
}

describe('authMiddleware', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('returns 401 if no token cookie is present', async () => {
        const { authMiddleware } = await esmock('../../../src/middleware/authMiddleware.js');

        const req = { cookies: {} };
        const res = mockRes();
        const next = sinon.stub();

        await authMiddleware(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(next.called).to.be.false;
    });

    it('returns 401 if the token is invalid or expired', async () => {
        const { authMiddleware } = await esmock('../../../src/middleware/authMiddleware.js', {
            jsonwebtoken: {
                default: { verify: sinon.stub().throws(new Error('invalid token')) }
            }
        });

        const req = { cookies: { token: 'badtoken' } };
        const res = mockRes();
        const next = sinon.stub();

        await authMiddleware(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(next.called).to.be.false;
    });

    it('returns 401 if the decoded user no longer exists', async () => {
        const { authMiddleware } = await esmock('../../../src/middleware/authMiddleware.js', {
            jsonwebtoken: {
                default: { verify: sinon.stub().returns({ userId: '123' }) }
            },
            '../../../src/repositories/userRepository.js': {
                findUserById: sinon.stub().resolves(null)
            }
        });

        const req = { cookies: { token: 'validtoken' } };
        const res = mockRes();
        const next = sinon.stub();

        await authMiddleware(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(next.called).to.be.false;
    });

    it('forwards a database failure to next instead of returning 401', async () => {
        const dbErr = new Error('connection lost');

        const { authMiddleware } = await esmock('../../../src/middleware/authMiddleware.js', {
            jsonwebtoken: {
                default: { verify: sinon.stub().returns({ userId: '123' }) }
            },
            '../../../src/repositories/userRepository.js': {
                findUserById: sinon.stub().rejects(dbErr)
            }
        });

        const req = { cookies: { token: 'validtoken' } };
        const res = mockRes();
        const next = sinon.stub();

        await authMiddleware(req, res, next);

        expect(next.calledWith(dbErr)).to.be.true;
        expect(res.status.called).to.be.false;
    });
    
    it('attaches req.user and calls next on valid token', async () => {
        const fakeUser = { _id: '123', name: 'Test User' };

        const { authMiddleware } = await esmock('../../../src/middleware/authMiddleware.js', {
            jsonwebtoken: {
                default: { verify: sinon.stub().returns({ userId: '123' }) }
            },
            '../../../src/repositories/userRepository.js': {
                findUserById: sinon.stub().resolves(fakeUser)
            }
        });

        const req = { cookies: { token: 'validtoken' } };
        const res = mockRes();
        const next = sinon.stub();

        await authMiddleware(req, res, next);

        expect(req.user).to.equal(fakeUser);
        expect(next.called).to.be.true;
        expect(res.status.called).to.be.false;
    });
});