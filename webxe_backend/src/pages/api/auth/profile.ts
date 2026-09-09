import type { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware } from "../../../../middlewares/authMiddleware";
import { applyCors } from "../../../utils/apiCors";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Phương thức không được hỗ trợ" });
  }

  return authMiddleware(req, res, () => {
    res.json({
      message: "Thông tin user từ token",
      user: (req as NextApiRequest & { user?: unknown }).user,
    });
  });
}
