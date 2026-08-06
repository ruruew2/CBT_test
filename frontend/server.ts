import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const JWT_SECRET = process.env.JWT_SECRET || "cbt-exam-secret-key-12345";

// In-memory "database"
const users: any[] = [];
const examResults: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, password: hashedPassword, name };
    users.push(newUser);
    
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "로그아웃 되었습니다." });
  });

  // Get Current User
  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "인증되지 않았습니다." });
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = users.find(u => u.id === decoded.userId);
      if (!user) return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (e) {
      res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
  });

  // Save Exam Result
  app.post("/api/exam/results", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "인증이 필요합니다." });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const { result, answers } = req.body;
      const newResult = {
        id: Date.now().toString(),
        userId: decoded.userId,
        result,
        answers,
        createdAt: new Date().toISOString()
      };
      examResults.push(newResult);
      res.json(newResult);
    } catch (e) {
      res.status(401).json({ message: "인증 실패" });
    }
  });

  // Get User Results (for MyPage/Wrong Answers)
  app.get("/api/exam/results", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "인증이 필요합니다." });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userResults = examResults.filter(r => r.userId === decoded.userId);
      res.json(userResults);
    } catch (e) {
      res.status(401).json({ message: "인증 실패" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
