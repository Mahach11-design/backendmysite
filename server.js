import express from 'express';
import cors from 'cors';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

async function getProjects() {
  const filePath = path.join(__dirname, 'projects.json');
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mahach portfolio API is running',
    endpoints: ['/api/projects', '/api/projects/:id']
  });
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await getProjects();
    const { type, status } = req.query;

    const filtered = projects.filter(project => {
      const byType = type ? project.type === type : true;
      const byStatus = status ? project.status === status : true;
      return byType && byStatus;
    });

    res.json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Cannot load projects' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const projects = await getProjects();
    const project = projects.find(item => String(item.id) === String(req.params.id));

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Cannot load project' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio API started on port ${PORT}`);
});
