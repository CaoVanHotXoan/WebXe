import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../../config/db";
import { getAllTablesData } from "../../../../controllers/dataController";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Phương thức không được hỗ trợ" });
  }

  try {
    await connectDB();
    return getAllTablesData(req, res);
  } catch (error) {
    console.error("Lỗi kết nối database:", error);
    return res.status(503).json({ message: "Không thể kết nối cơ sở dữ liệu" });
  }
}
