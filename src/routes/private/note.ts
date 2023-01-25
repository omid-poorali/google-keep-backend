import { useRouter } from 'hofs';
import { Enums } from 'commons';
import * as Models from "models";
import * as Utils from "utils";

export const createNote = useRouter({
  method: Enums.HTTPMethod.POST,
  path: "/note",
  role: [Enums.Role.USER],
  handler: async (req) => {

    const {
      title,
      body,
      tags
    } = req.body;

    const board = await Models.Board.findOne({ "account": req.payload.account });
    const now = Utils.Date.nowInSeconds();

    if (board) {
      const updatedBoard = await Models.Board.findByIdAndUpdate(board.id, {
        $push: {
          notes: {
            title,
            body,
            tags,
            createdAt: now,
            updatedAt: now,
          }
        },
        $set: { updatedAt: now }
      }, {
        returnOriginal: false
      });

      if (updatedBoard) {
        return {
          status: Enums.HTTPStatus.SUCCESS,
          data: updatedBoard.notes[updatedBoard.notes.length - 1]
        }
      }

      return {
        status: Enums.HTTPStatus.BAD_REQUEST
      }

    }
    else {
      const newBoard = await new Models.Board({
        account: req.payload.account,
        notes: [{
          title,
          body,
          tags,
          createdAt: now,
          updatedAt: now,
        }],
        createdAt: now,
        updatedAt: now,
      }).save();

      if (newBoard) {
        return {
          status: Enums.HTTPStatus.SUCCESS,
          data: newBoard.notes[newBoard.notes.length - 1]
        }
      }

      return {
        status: Enums.HTTPStatus.BAD_REQUEST
      }

    }
  }
});


export const updateNote = useRouter({
  method: Enums.HTTPMethod.PUT,
  path: "/note",
  role: [Enums.Role.USER],
  handler: async (req) => {

    const {
      id,
      title,
      body,
      tags
    } = req.body;

    const now = Utils.Date.nowInSeconds();

    const board = await Models.Board.findOneAndUpdate({
      account: req.payload.account, 'notes._id': id
    }, {
      $set: {
        'notes.$.title': title,
        'notes.$.body': body,
        'notes.$.tags': tags,
        'notes.$.updatedAt': now,
        updatedAt: now
      }
    }, {
      returnOriginal: false
    });

    if (board) {
      return {
        status: Enums.HTTPStatus.SUCCESS,
        data: board.notes.find(note => note._id.toString().includes(id))
      }
    }

    return {
      status: Enums.HTTPStatus.BAD_REQUEST
    }
  }
});


export const deleteNote = useRouter({
  method: Enums.HTTPMethod.DELETE,
  path: "/note",
  role: [Enums.Role.USER],
  handler: async (req) => {

    const {
      id
    } = req.body;

    const targetNote = await Models.Board.findOne({ account: req.payload.account, 'notes._id': id });

    if (!targetNote) {
      return {
        status: Enums.HTTPStatus.BAD_REQUEST
      }
    }
    else {
      const now = Utils.Date.nowInSeconds();
      const updatedBoard = await Models.Board.findOneAndUpdate({
        account: req.payload.account
      }, {
        $pull: {
          notes: {
            _id: id
          },
        },
        $set: { updatedAt: now }
      }, {
        returnOriginal: false
      });

      if (updatedBoard) {
        return {
          status: Enums.HTTPStatus.SUCCESS
        }
      }

      return {
        status: Enums.HTTPStatus.BAD_REQUEST
      }
    }
  }
});

export const getMyNotes = useRouter({
  method: Enums.HTTPMethod.GET,
  path: "/note",
  role: [Enums.Role.USER],
  handler: async (req) => {
    const board = await Models.Board.findOne({
      account: req.payload.account
    });

    return {
      status: Enums.HTTPStatus.SUCCESS,
      data: board?.notes ?? []
    }
  }
});