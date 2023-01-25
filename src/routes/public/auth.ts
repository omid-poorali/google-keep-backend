import { Response } from "express";
import JWT from "jsonwebtoken";
import { useRouter } from "hofs";
import { v4 as uuidv4 } from "uuid";
import { Enums, Errors } from "commons";
import * as Models from "models";
import * as Utils from "utils";

const calculatExpirationTime = {
  accessToken: () => 60 * 15, // 15 minutes
  refreshToken: () => Utils.Date.nowInSeconds() + 60 * 60 * 24 * 360, // 1 year
}

const generateTokens = (account: Pick<Models.Account, '_id' | 'role'>) => {

  const accessToken = JWT.sign({
    account: account._id.toString(),
    role: account.role
  }, process.env.JWT_SECRET as string, {
    expiresIn: `${calculatExpirationTime.accessToken()}s`
  });

  const refreshToken = {
    account: account._id,
    token: uuidv4(),
    expiredAt: calculatExpirationTime.refreshToken()
  }

  new Models.RefreshToken(refreshToken).save().catch(err => console.log(err));

  return {
    accessToken,
    refreshToken
  };
}


export const login = (account: Pick<Models.Account, '_id' | 'role'>, res: Response) => {
  const { refreshToken, accessToken } = generateTokens(account);

  res.cookie("refreshToken", refreshToken.token, {
    expires: new Date(calculatExpirationTime.refreshToken() * 1000),
    httpOnly: true
  })

  return {
    status: Enums.HTTPStatus.SUCCESS,
    data: {
      accessToken
    }
  }
}


export const signUp = useRouter({
  method: Enums.HTTPMethod.POST,
  path: "/auth/sign-up",
  role: [],
  handler: async (req, res) => {

    const { email, password } = req.body;
    let account = await Models.Account.findOne({ email });

    if (account) {
      const isMatch = await account.comparePassword(password);
      if (isMatch) {
        return login(account, res);
      }
      else {
        return {
          status: Enums.HTTPStatus.BAD_REQUEST
        }
      }
    }
    else {
      account = await new Models.Account({
        email,
        password,
        createdAt: Utils.Date.nowInSeconds(),
        updatedAt: Utils.Date.nowInSeconds(),
      }).save();

      return login(account, res);
    };
  }
});

export const refreshToken = useRouter({
  method: Enums.HTTPMethod.POST,
  path: "/auth/refresh-token",
  role: [],
  handler: async (req, res) => {

    const { refreshToken } = req.cookies;
    const refreshTokenDoc = await Models.RefreshToken.findOne({ token: refreshToken })
      .populate<{ account: Models.Account }>("account", ["_id", "phoneNumberStatus", "role"]).orFail();

    if (refreshTokenDoc) {
      if (typeof refreshTokenDoc?.expiredAt !== "number" || Utils.Date.isExpired(refreshTokenDoc.expiredAt)) {
        refreshTokenDoc.remove();
        return {
          status: Enums.HTTPStatus.UNAUTHORIZED,
          message: Errors.UNAUTHENTICATED
        }
      }
      else {
        return login(refreshTokenDoc.account, res);
      }
    }
    else {
      return {
        status: Enums.HTTPStatus.BAD_REQUEST,
        message: Errors.INVALID_INPUT
      }
    }
  }
});