import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Note } from '../../../src/models/Note.js';
import { createNote, findNotesByOwner, findNoteById, updateNoteById, deleteNoteById } from '../../../src/repositories/notesRepository.js';

describe('notesRepository', () => {
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
        await Note.deleteMany({});
    });

    it('createNote saves a note to the database', async () => {
        const note = await createNote({ title: 'Test', content: 'Content', owner: new mongoose.Types.ObjectId() });

        expect(note._id).to.exist;
        expect(note.title).to.equal('Test');
    });

    it('findNotesByOwner returns only that owner\'s notes, sorted by most recently updated first', async () => {
        const owner1 = new mongoose.Types.ObjectId();
        const owner2 = new mongoose.Types.ObjectId();

        const older = await createNote({ title: 'Older', content: '...', owner: owner1 });
        await new Promise((resolve) => setTimeout(resolve, 10));
        const newer = await createNote({ title: 'Newer', content: '...', owner: owner1 });
        await createNote({ title: 'Not mine', content: 'Content', owner: owner2 });

        const results = await findNotesByOwner(owner1);

        expect(results).to.have.length(2);
        expect(results[0]._id.toString()).to.equal(newer._id.toString());
        expect(results[1]._id.toString()).to.equal(older._id.toString());
    });

    it('findNoteById returns the correct note regardless of the owner', async () => {
        const created = await createNote({ title: 'Test', content: 'Content', owner: new mongoose.Types.ObjectId() });

        const found = await findNoteById(created._id);

        expect(found._id.toString()).to.equal(created._id.toString());
    });

    it('updateNoteById updates and returns the new version, enforcing schema validation', async () => {
        const created = await createNote({ title: 'Original', content: 'Content', owner: new mongoose.Types.ObjectId() });

        const updated = await updateNoteById(created._id, { title: 'Changed' });

        expect(updated.title).to.equal('Changed');
    });

    it('updateNoteById rejects an invalid update due to runValidators', async () => {
        const created = await createNote({ title: 'Original', content: 'Content', owner: new mongoose.Types.ObjectId() });

        try {
            await updateNoteById(created._id, { title: '' });
            expect.fail('Expected update to fail validation');
        }
        catch (err) {
            expect(err).to.exist;
        }
    });

    it('deleteNoteById removes the note from the database', async () => {
        const created = await createNote({ title: 'To Delete', content: 'Content', owner: new mongoose.Types.ObjectId() });

        await deleteNoteById(created._id);

        const found = await findNoteById(created._id);
        expect(found).to.be.null;
    });
});