import { useRouter } from 'hofs';
import { Enums } from 'commons';
import * as Models from "models";
import * as Utils from "utils";

export const createTag = useRouter({
  method: Enums.HTTPMethod.POST,
  path: "/tag",
  role: [Enums.Role.USER],
  handler: async (req) => {

    const {
      name
    } = req.body;

    const board = await Models.Board.findOne({ "account": req.payload.account });
    const now = Utils.Date.nowInSeconds();

    if (board) {
      const updatedBoard = await Models.Board.findByIdAndUpdate(board.id, {
        $push: {
          tags: {
            name,
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
          data: updatedBoard.tags[updatedBoard.tags.length - 1]
        }
      }

      return {
        status: Enums.HTTPStatus.BAD_REQUEST
      }

    }
    else {
      const newBoard = await new Models.Board({
        account: req.payload.account,
        tags: [{
          name,
          createdAt: now,
          updatedAt: now,
        }],
        createdAt: now,
        updatedAt: now,
      }).save();

      if (newBoard) {
        return {
          status: Enums.HTTPStatus.SUCCESS,
          data: newBoard.tags[newBoard.tags.length - 1]
        }
      }

      return {
        status: Enums.HTTPStatus.BAD_REQUEST
      }
    }
  }
});


export const updateTag = useRouter({
  method: Enums.HTTPMethod.PUT,
  path: "/tag",
  role: [Enums.Role.USER],
  handler: async (req) => {

    const {
      id,
      name
    } = req.body;

    const now = Utils.Date.nowInSeconds();

    const board = await Models.Board.findOneAndUpdate({
      account: req.payload.account, 'tags._id': id
    }, {
      $set: {
        'tags.$.name': name,
        'tags.$.updatedAt': now,
        updatedAt: now
      }
    }, {
      returnOriginal: false
    });

    if (board) {
      return {
        status: Enums.HTTPStatus.SUCCESS,
        data: board.tags.find(tag => tag._id.toString().includes(id))
      }
    }

    return {
      status: Enums.HTTPStatus.BAD_REQUEST
    }
  }
});

export const deleteTag = useRouter({
  method: Enums.HTTPMethod.DELETE,
  path: "/tag",
  role: [Enums.Role.USER],
  handler: async (req) => {

    const {
      id
    } = req.body;

    const targetTag = await Models.Board.findOne({ account: req.payload.account, 'tags._id': id });

    if (!targetTag) {
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
          tags: {
            _id: id
          }
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


export const getMyTags = useRouter({
  method: Enums.HTTPMethod.GET,
  path: "/tag",
  role: [Enums.Role.USER],
  handler: async (req) => {
    const board = await Models.Board.findOne({
      account: req.payload.account
    });

    return {
      status: Enums.HTTPStatus.SUCCESS,
      data: board?.tags ?? []
    }
  }
});