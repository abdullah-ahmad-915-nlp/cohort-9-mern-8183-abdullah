import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

function mockRes() {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.cookie = sinon.stub().returns(res);
    res.clearCookie = sinon.stub().returns(res);
    return res;
}

describe('authController', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('register', () => {
        it('calls registerUser with body fields and returns 201', async () => {
            const registerUserStub = sinon.stub().resolves({ _id: '123', name: 'Test' });

            const { register } = await esmock('../../../src/controllers/authController.js', {
                '../../../src/services/authService.js': {
                    registerUser: registerUserStub
                }
            });

            const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
            const res = mockRes();
            const next = sinon.stub();

            await register(req, res, next);

            expect(registerUserStub.calledWith('Test', 'test@example.com', 'password123')).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('it forwards errors to next instead of responding', async () => {
            const fakeErr = new Error('Please fill all the fields');
            fakeErr.statusCode = 400;

            const { register } = await esmock('../../../src/controllers/authController.js', {
                '../../../src/services/authService.js': {
                    registerUser: sinon.stub().rejects(fakeErr)
                }
            });

            const req = { body: { name: '', email: '', password: '' } };
            const res = mockRes();
            const next = sinon.stub();

            await register(req, res, next);

            expect(next.calledWith(fakeErr)).to.be.true;
            expect(res.status.called).to.be.false;
        });
    });

    describe('login', () => {
        it('sets an HttpOnly cookie and returns 200 with a success message', async () => {
            const loginUserStub = sinon.stub().resolves('fake.jwt.token');

            const { login } = await esmock('../../../src/controllers/authController.js', {
                '../../../src/services/authService.js': {
                    loginUser: loginUserStub
                }
            });

            const req = { body: { email: 'test@example.com', password: 'password123' } };
            const res = mockRes();
            const next = sinon.stub();

            await login(req, res, next);

            expect(loginUserStub.calledWith('test@example.com', 'password123')).to.be.true;
            expect(res.cookie.calledWith('token', 'fake.jwt.token')).to.be.true;

            const cookieOptions = res.cookie.getCall(0).args[2];
            expect(cookieOptions.httpOnly).to.be.true;
            expect(cookieOptions.sameSite).to.equal('strict');

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ message: 'Logged in successfully' })).to.be.true;
        });

        it('forwards errors to next instead of setting a cookie', async () => {
            const fakeErr = new Error('Invalid credentials');
            fakeErr.statusCode = 401;

            const { login } = await esmock('../../../src/controllers/authController.js', {
                '../../../src/services/authService.js': {
                    loginUser: sinon.stub().rejects(fakeErr)
                }
            });

            const req = { body: { email: 'test@example.com', password: 'wrong' } };
            const res = mockRes();
            const next = sinon.stub();

            await login(req, res, next);

            expect(next.calledWith(fakeErr)).to.be.true;
            expect(res.cookie.called).to.be.false;
        });
    });

    describe('logout', () => {
        it('clears the token cookie and returns 200', async () => {
            const { logout } = await esmock('../../../src/controllers/authController.js');

            const req = {};
            const res = mockRes();
            const next = sinon.stub();

            await logout(req, res, next);

            expect(res.clearCookie.calledWith('token')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ message: 'Logged out successfully' })).to.be.true;
        });
    });

    describe('getMe', () => {
        it('returns req.user with 200', async () => {
            const { getMe } = await esmock('../../../src/controllers/authController.js');

            const fakeUser = { _id: '123', name: 'Test User', email: 'test@example.com' };
            const req = { user: fakeUser };
            const res = mockRes();
            const next = sinon.stub();

            await getMe(req, res, next);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(fakeUser)).to.be.true;
        });
    });
});