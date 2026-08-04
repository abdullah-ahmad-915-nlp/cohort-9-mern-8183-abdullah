import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../../src/models/User.js';
import { createUser, findUserByEmail, findUserById, findUserByEmailWithPassword } from '../../../src/repositories/userRepository.js';

describe('userRepository', () => {
    let mongoServer;

    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it('createUser saves a user to the database', async () => {
        const user = await createUser({ name: 'Test User', email: 'test@example.com', password: 'hashedpassword' });

        expect(user._id).to.exist;
        expect(user.email).to.equal('test@example.com');
    });

    it('findUserByEmail returns the matching user without the password field', async () => {
        await createUser({ name: 'Test User', email: 'test@example.com', password: 'hashedpassword' });

        const found = await findUserByEmail('test@example.com');

        expect(found).to.exist;
        expect(found.password).to.be.undefined;
    });

    it('findUserByEmail returns null for a non-existent email', async () => {
        const found = await findUserByEmail('nouser@example.com');

        expect(found).to.be.null;
    });

    it('findUserById returns the matching user without the password field', async () => {
        const created = await createUser({ name: 'Test User', email: 'test@example.com', password: 'hashedpassword' });

        const found = await findUserById(created._id);

        expect(found._id.toString()).to.equal(created._id.toString());
        expect(found.password).to.be.undefined;
    });

    it('findUserByEmailWithPassword includes the password field', async () => {
        await createUser({ name: 'Test User', email: 'test@example.com', password: 'hashedpassword' });

        const found = await findUserByEmailWithPassword('test@example.com');

        expect(found.password).to.equal('hashedpassword');
    });
});