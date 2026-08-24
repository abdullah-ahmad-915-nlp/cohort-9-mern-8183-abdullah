import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('authService', () => {
    afterEach (() => {
        sinon.restore();
    });

    describe('registerUser', () => {
        it('throws 400 if any field is missing', async () => {
            const { registerUser } = await esmock('../../../src/services/authService.js');

            try {
                await registerUser('', 'test@example.com', 'password123');
                expect.fail('Expected registerUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(400);
            }
        });

        it('throws 409 if the email is already in use', async () => {
            const { registerUser } = await esmock ('../../../src/services/authService.js', {
                '../../../src/repositories/userRepository.js': {
                    findUserByEmail: sinon.stub().resolves({ _id: '123', email: 'test@example.com'})
                }
            });

            try {
                await registerUser('Test User', 'test@example.com', 'password123');
                expect.fail('Expected registerUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(409);
            }
        });

        it('creates a user and returns it without the password field', async () => {
            const fakeUser = { toObject: () => ({ _id: '123', name: 'Test User', email: 'test@example.com', password: 'hashedpassword' }), };

            const { registerUser } = await esmock ('../../../src/services/authService.js', {
                '../../../src/repositories/userRepository.js': {
                    findUserByEmail: sinon.stub().resolves(null),
                    createUser: sinon.stub().resolves(fakeUser)
                },
                bcrypt: {
                    hash: sinon.stub().resolves('hashedpassword')
                }
            });

            const result = await registerUser('Test User', 'test@example.com', 'password123');

            expect(result).to.not.have.property('password');
            expect(result.email).to.equal('test@example.com');
        });
    });

    describe('loginUser', () => {
        it('throws 400 if email or password is missing', async () => {
            const { loginUser } = await esmock('../../../src/services/authService.js');

            try {
                await loginUser('', 'password123');
                expect.fail('Expected loginUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(400);
            }
        });

        it('throws 401 if no user is found for the email', async () => {
            const { loginUser } = await esmock('../../../src/services/authService.js', {
                '../../../src/repositories/userRepository.js': {
                    findUserByEmailWithPassword: sinon.stub().resolves(null)
                }
            });

            try {
                await loginUser('nouser@example.com', 'password123');
                expect.fail('Expected loginUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(401);
            }
        });

        it('throws 401 if the password does not match', async () => {
            const { loginUser } = await esmock('../../../src/services/authService.js', {
                '../../../src/repositories/userRepository.js': {
                    findUserByEmailWithPassword: sinon.stub().resolves({ _id: '123', password: 'hashedpassword'})
                },
                bcrypt: {
                    compare: sinon.stub().resolves(false)
                }
            });

            try {
                await loginUser('test@example.com', 'wrongpassword');
                expect.fail('Expected loginUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(401);
            }
        });

        it('returns a token on successful login', async () => {
            const { loginUser } = await esmock('../../../src/services/authService.js', {
                '../../../src/repositories/userRepository.js': {
                    findUserByEmailWithPassword: sinon.stub().resolves({ _id: '123', password: 'hashedpassword'})
                },
                bcrypt: {
                    compare: sinon.stub().resolves(true)
                },
                jsonwebtoken: {
                    default: { sign: sinon.stub().returns('fake.jwt.token') }
                }
            });

            const token = await loginUser('test@example.com', 'password123');

            expect(token).to.equal('fake.jwt.token');
        });
    });
});