// app/api/posts/route.js
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const postsFile = path.join(process.cwd(), "data", "posts.json");
    const raw = await fs.promises.readFile(postsFile, "utf8");
    const posts = JSON.parse(raw);
    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (err) {
    // no posts yet
    return new Response(JSON.stringify([]), { status: 200 });
  }
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file"); // file may be null
    const text = form.get("text") ? String(form.get("text")) : "";
    const userId = form.get("userId") ? String(form.get("userId")) : null;
    const username = form.get("username") ? String(form.get("username")) : null;

    let mediaUrl = null;

    // If there's a file, save it to public/uploads
    if (file && typeof file === "object" && file.size && file.name) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.promises.mkdir(uploadsDir, { recursive: true });

      // create a unique filename
      const ext = path.extname(file.name) || "";
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const filepath = path.join(uploadsDir, unique);

      await fs.promises.writeFile(filepath, buffer);
      mediaUrl = `/uploads/${unique}`;
    }

    // posts store
    const postsDir = path.join(process.cwd(), "data");
    await fs.promises.mkdir(postsDir, { recursive: true });
    const postsFile = path.join(postsDir, "posts.json");

    let posts = [];
    try {
      const raw = await fs.promises.readFile(postsFile, "utf8");
      posts = JSON.parse(raw);
    } catch (e) {
      posts = [];
    }

    const post = {
      id: Date.now().toString(),
      text,
      mediaUrl,
      userId,
      username,
      createdAt: new Date().toISOString(),
      votes: 0,
      comments: [],
    };

    // add to front
    posts.unshift(post);
    await fs.promises.writeFile(postsFile, JSON.stringify(posts, null, 2), "utf8");

    return new Response(JSON.stringify(post), { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
