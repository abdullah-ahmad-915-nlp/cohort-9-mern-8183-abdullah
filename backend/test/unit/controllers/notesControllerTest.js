import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

function mockRes() {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
}

function mockReq(overrides = {}) {
  return { user: { _id: 'user1' }, params: {}, body: {}, ...overrides };
}

describe('notesController', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('createNote', () => {
        it('calls createNoteForUser with correct args and returns 201', async () => {
            const createNoteForUserStub = sinon.stub().resolves({ _id: 'note1', title: 'Test' });

            const { createNote } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    createNoteForUser: createNoteForUserStub,
                },
            });

            const req = mockReq({ body: { title: 'Test', content: 'Content' } });
            const res = mockRes();
            const next = sinon.stub();

            await createNote(req, res, next);

            expect(createNoteForUserStub.calledWith('user1', 'Test', 'Content')).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('forwards errors to next', async () => {
            const fakeErr = new Error('Title and content are required');
            fakeErr.statusCode = 400;

            const { createNote } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    createNoteForUser: sinon.stub().rejects(fakeErr),
                },
            });

            const req = mockReq({ body: { title: '', content: '' } });
            const res = mockRes();
            const next = sinon.stub();

            await createNote(req, res, next);

            expect(next.calledWith(fakeErr)).to.be.true;
            expect(res.status.called).to.be.false;
        });
    });

    describe('getNotes', () => {
        it('calls getNotesForUser and returns 200', async () => {
            const getNotesForUserStub = sinon.stub().resolves([{ _id: 'note1' }]);

            const { getNotes } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    getNotesForUser: getNotesForUserStub,
                },
            });

            const req = mockReq();
            const res = mockRes();
            const next = sinon.stub();

            await getNotes(req, res, next);

            expect(getNotesForUserStub.calledWith('user1')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
        });
    });

    describe('getNote', () => {
        it('calls getNoteForUser with correct args and returns 200', async () => {
            const getNoteForUserStub = sinon.stub().resolves({ _id: 'note1' });

            const { getNote } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    getNoteForUser: getNoteForUserStub,
                },
            });

            const req = mockReq({ params: { id: 'note1' } });
            const res = mockRes();
            const next = sinon.stub();

            await getNote(req, res, next);

            expect(getNoteForUserStub.calledWith('user1', 'note1')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
        });

        it('forwards a 403 error to next', async () => {
            const fakeErr = new Error('Not authorized to access this note');
            fakeErr.statusCode = 403;

            const { getNote } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    getNoteForUser: sinon.stub().rejects(fakeErr),
                },
            });

            const req = mockReq({ params: { id: 'note1' } });
            const res = mockRes();
            const next = sinon.stub();

            await getNote(req, res, next);

            expect(next.calledWith(fakeErr)).to.be.true;
        });
    });

    describe('updateNote', () => {
        it('calls updateNoteForUser with correct args and returns 200', async () => {
            const updateNoteForUserStub = sinon.stub().resolves({ _id: 'note1', title: 'Updated' });

            const { updateNote } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    updateNoteForUser: updateNoteForUserStub,
                },
            });

            const req = mockReq({ params: { id: 'note1' }, body: { title: 'Updated' } });
            const res = mockRes();
            const next = sinon.stub();

            await updateNote(req, res, next);

            expect(updateNoteForUserStub.calledWith('user1', 'note1', { title: 'Updated' })).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
        });
    });

    describe('deleteNote', () => {
        it('calls deleteNoteForUser with correct args and returns 200', async () => {
            const deleteNoteForUserStub = sinon.stub().resolves({ _id: 'note1' });

            const { deleteNote } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    deleteNoteForUser: deleteNoteForUserStub,
                },
            });

            const req = mockReq({ params: { id: 'note1' } });
            const res = mockRes();
            const next = sinon.stub();

            await deleteNote(req, res, next);

            expect(deleteNoteForUserStub.calledWith('user1', 'note1')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
        });

        it('forwards a 404 error to next', async () => {
            const fakeErr = new Error('Note not found');
            fakeErr.statusCode = 404;

            const { deleteNote } = await esmock('../../../src/controllers/notesController.js', {
                '../../../src/services/notesService.js': {
                    deleteNoteForUser: sinon.stub().rejects(fakeErr),
                },
            });

            const req = mockReq({ params: { id: 'note1' } });
            const res = mockRes();
            const next = sinon.stub();

            await deleteNote(req, res, next);

            expect(next.calledWith(fakeErr)).to.be.true;
        });
    });
});