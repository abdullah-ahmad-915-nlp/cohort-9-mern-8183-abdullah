import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('notesService', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('createNoteForUser', () => {
        it('throws 400 if title is missing', async () => {
            const { createNoteForUser } = await esmock('../../../src/services/notesService.js');

            try {
                await createNoteForUser('user1', '', 'some content');
                expect.fail('Expected createNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(400);
            }
        });

        it('throws 400 if content is missing', async () => {
            const { createNoteForUser } = await esmock('../../../src/services/notesService.js');

            try {
                await createNoteForUser('user1', 'a title', '');
                expect.fail('Expected createNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(400);
            }
        });

        it('creates a note tied to the correct owner when input is valid', async () => {
            const createNoteStub = sinon.stub().resolves({ _id: 'note1', title: 'My Note', content: 'Some content', owner: 'user1' });

            const { createNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    createNote: createNoteStub,
                },
            });

            const note = await createNoteForUser('user1', 'My Note', 'Some content');

            expect(createNoteStub.calledWith({ title: 'My Note', content: 'Some content', owner: 'user1' })).to.be.true;
            expect(note.owner).to.equal('user1');
        });
    });

    describe('getNotesForUser', () => {
        it('calls findNotesByOwner with the correct owner id', async () => {
            const findNotesByOwnerStub = sinon.stub().resolves([{ _id: 'note1', owner: 'user1' }]);

            const { getNotesForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNotesByOwner: findNotesByOwnerStub,
                },
            });

            const notes = await getNotesForUser('user1');

            expect(findNotesByOwnerStub.calledWith('user1')).to.be.true;
            expect(notes).to.have.length(1);
        });
    });

    describe('getNoteForUser', () => {
        it('throws 404 if the note does not exist', async () => {
            const { getNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves(null),
                },
            });

            try {
                await getNoteForUser('user1', 'nonexistent');
                expect.fail('Expected getNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(404);
            }
        });

        it('throws 403 if the note belongs to a different user', async () => {
            const { getNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves({ _id: 'note1', owner: { toString: () => 'user2' }, }),
                },
            });

            try {
                await getNoteForUser('user1', 'note1');
                expect.fail('Expected getNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(403);
            }
        });

        it('returns the note when ownership matches', async () => {
            const fakeNote = { _id: 'note1', owner: { toString: () => 'user1' } };

            const { getNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves(fakeNote),
                },
            });

            const note = await getNoteForUser('user1', 'note1');

            expect(note).to.equal(fakeNote);
        });
    });

    describe('updateNoteForUser', () => {
        it('throws 400 if title is present but empty', async () => {
            const { updateNoteForUser } = await esmock('../../../src/services/notesService.js');

            try {
                await updateNoteForUser('user1', 'note1', { title: '' });
                expect.fail('Expected updateNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(400);
                expect(err.message).to.equal('Title and content are required');
            }
        });

        it('throws 400 if content is only an empty Tiptap paragraph', async () => {
            const { updateNoteForUser } = await esmock('../../../src/services/notesService.js');

            try {
                await updateNoteForUser('user1', 'note1', { content: '<p></p>' });
                expect.fail('Expected updateNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(400);
                expect(err.message).to.equal('Title and content are required');
            }
        });

        it('throws 404 if the note does not exist', async () => {
            const { updateNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves(null),
                },
            });

            try {
                await updateNoteForUser('user1', 'nonexistent', { title: 'New Title' });
                expect.fail('Expected updateNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(404);
            }
        });

        it('throws 403 if the note belongs to a different user', async () => {
            const { updateNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves({ _id: 'note1', owner: { toString: () => 'user2' }, }),
                },
            });

            try {
                await updateNoteForUser('user1', 'note1', { title: 'New Title' });
                expect.fail('Expected updateNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(403);
            }
        });

        it('updates the note when ownership matches', async () => {
            const updateNoteByIdStub = sinon.stub().resolves({ _id: 'note1', title: 'New Title' });

            const { updateNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves({ _id: 'note1', owner: { toString: () => 'user1' }, }),
                    updateNoteById: updateNoteByIdStub,
                },
            });

            const updated = await updateNoteForUser('user1', 'note1', { title: 'New Title' });

            expect(updateNoteByIdStub.calledWith('note1', { title: 'New Title' })).to.be.true;
            expect(updated.title).to.equal('New Title');
        });
    });

    describe('deleteNoteForUser', () => {
        it('throws 404 if the note does not exist', async () => {
            const { deleteNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves(null),
                },
            });

            try {
                await deleteNoteForUser('user1', 'nonexistent');
                expect.fail('Expected deleteNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(404);
            }
        });

        it('throws 403 if the note belongs to a different user', async () => {
            const { deleteNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves({ _id: 'note1', owner: { toString: () => 'user2' }, }),
                },
            });

            try {
                await deleteNoteForUser('user1', 'note1');
                expect.fail('Expected deleteNoteForUser to throw');
            }
            catch (err) {
                expect(err.statusCode).to.equal(403);
            }
        });

        it('deletes the note when ownership matches', async () => {
            const deleteNoteByIdStub = sinon.stub().resolves({ _id: 'note1' });

            const { deleteNoteForUser } = await esmock('../../../src/services/notesService.js', {
                '../../../src/repositories/notesRepository.js': {
                    findNoteById: sinon.stub().resolves({ _id: 'note1', owner: { toString: () => 'user1' }, }),
                    deleteNoteById: deleteNoteByIdStub,
                },
            });

            const result = await deleteNoteForUser('user1', 'note1');

            expect(deleteNoteByIdStub.calledWith('note1')).to.be.true;
            expect(result._id).to.equal('note1');
        });
    });
});