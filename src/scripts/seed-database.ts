import AppDataSource from '../data-source';
import * as bcrypt from 'bcryptjs';

interface UserData {
  id: string;
  email: string;
  username: string;
  password: string;
  avatarUrl: string;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

interface TagData {
  id: string;
  name: string;
  slug: string;
}

interface PostData {
  id: string;
  authorId: string;
  title: string;
  content: string;
  slug: string;
  categoryIds: string[];
  tagIds: string[];
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    await AppDataSource.initialize();
    const conn = AppDataSource.manager;

    // Check if seeding was already done
    const existingUsers = await conn.query('SELECT COUNT(*) as count FROM "users" WHERE roles = $1', ['user']);
    if (existingUsers[0].count > 0) {
      console.log('✅ Database already seeded with users, skipping...');
      return;
    }

    console.log('📝 Creating sample users...');
    const users = await createUsers(conn);
    
    console.log('📂 Creating categories...');
    const categories = await createCategories(conn);
    
    console.log('🏷️  Creating tags...');
    const tags = await createTags(conn);
    
    console.log('✍️  Creating posts...');
    const posts = await createPosts(conn, users, categories, tags);
    
    console.log('❤️  Creating post likes...');
    await createPostLikes(conn, users, posts);
    
    console.log('💬 Creating comments...');
    const comments = await createComments(conn, users, posts);
    
    console.log('🔗 Creating comment replies...');
    const replies = await createCommentReplies(conn, users, comments);
    
    console.log('👍 Creating comment likes...');
    await createCommentLikes(conn, users, [...comments, ...replies]);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
    📊 Summary:
    - Users: ${users.length}
    - Categories: ${categories.length}
    - Tags: ${tags.length}
    - Posts: ${posts.length}
    - Comments: ${comments.length + replies.length}
    `);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

async function createUsers(conn: any): Promise<UserData[]> {
  const usersData: Omit<UserData, 'id'>[] = [
    {
      email: 'ana.garcia@email.com',
      username: 'ana_dev',
      password: 'Ana123!',
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    {
      email: 'carlos.lopez@email.com',
      username: 'carlos_tech',
      password: 'Carlos123!',
      avatarUrl: 'https://i.pravatar.cc/150?img=2'
    },
    {
      email: 'maria.rodriguez@email.com',
      username: 'maria_code',
      password: 'Maria123!',
      avatarUrl: 'https://i.pravatar.cc/150?img=3'
    },
    {
      email: 'david.martinez@email.com',
      username: 'david_js',
      password: 'David123!',
      avatarUrl: 'https://i.pravatar.cc/150?img=4'
    },
    {
      email: 'lucia.sanchez@email.com',
      username: 'lucia_react',
      password: 'Lucia123!',
      avatarUrl: 'https://i.pravatar.cc/150?img=5'
    }
  ];

  const users: UserData[] = [];

  for (const userData of usersData) {
    const userIdResult = await conn.query('SELECT gen_random_uuid() as id');
    const id = userIdResult[0].id;
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    await conn.query(`
      INSERT INTO "users" (
        id, email, username, password_hash, avatar_url, 
        roles, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
    `, [
      id, 
      userData.email, 
      userData.username, 
      hashedPassword, 
      userData.avatarUrl,
      'user',
      true
    ]);

    users.push({ ...userData, id });
  }

  return users;
}

async function createCategories(conn: any): Promise<CategoryData[]> {
  const categoriesData = [
    {
      name: 'Desarrollo Web',
      slug: 'desarrollo-web'
    },
    {
      name: 'Ciencia de Datos',
      slug: 'ciencia-datos'
    },
    {
      name: 'DevOps',
      slug: 'devops'
    }
  ];

  const categories: CategoryData[] = [];

  for (const categoryData of categoriesData) {
    const categoryIdResult = await conn.query('SELECT gen_random_uuid() as id');
    const id = categoryIdResult[0].id;

    await conn.query(`
      INSERT INTO "categories" (
        id, name, slug, created_at, updated_at
      ) VALUES ($1, $2, $3, now(), now())
    `, [id, categoryData.name, categoryData.slug]);

    categories.push({ ...categoryData, id });
  }

  return categories;
}

async function createTags(conn: any): Promise<TagData[]> {
  const tagsData = [
    {
      name: 'JavaScript',
      slug: 'javascript'
    },
    {
      name: 'React',
      slug: 'react'
    },
    {
      name: 'Node.js',
      slug: 'nodejs'
    }
  ];

  const tags: TagData[] = [];

  for (const tagData of tagsData) {
    const tagIdResult = await conn.query('SELECT gen_random_uuid() as id');
    const id = tagIdResult[0].id;

    await conn.query(`
      INSERT INTO "tags" (
        id, name, slug, created_at, updated_at
      ) VALUES ($1, $2, $3, now(), now())
    `, [id, tagData.name, tagData.slug]);

    tags.push({ ...tagData, id });
  }

  return tags;
}

async function createPosts(conn: any, users: UserData[], categories: CategoryData[], tags: TagData[]): Promise<PostData[]> {
  const postsData = [
    {
      authorIndex: 0, // Ana
      title: 'Introducción a React Hooks: useState y useEffect',
      content: `React Hooks han revolucionado la forma en que escribimos componentes en React. En este artículo, exploraremos los dos hooks más fundamentales: useState y useEffect.

## useState: Manejando el Estado Local

El hook useState nos permite agregar estado local a componentes funcionales:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Contador: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>
    </div>
  );
}
\`\`\`

## useEffect: Efectos Secundarios

useEffect nos permite realizar efectos secundarios en componentes funcionales:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Cargando...</div>;
}
\`\`\`

Los hooks han simplificado enormemente el desarrollo con React, eliminando la necesidad de clases para manejar estado y efectos.`,
      slug: 'introduccion-react-hooks-usestate-useeffect',
      categoryIndexes: [0], // Desarrollo Web
      tagIndexes: [0, 1] // JavaScript, React
    },
    {
      authorIndex: 1, // Carlos
      title: 'Machine Learning con Python: Primeros Pasos',
      content: `Python se ha convertido en el lenguaje de facto para Machine Learning. En este tutorial, exploraremos cómo empezar con scikit-learn.

## Instalación y Configuración

Primero, necesitamos instalar las librerías necesarias:

\`\`\`bash
pip install scikit-learn pandas numpy matplotlib
\`\`\`

## Tu Primer Modelo de ML

Vamos a crear un modelo simple de clasificación:

\`\`\`python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Cargar datos
iris = load_iris()
X, y = iris.data, iris.target

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Entrenar modelo
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Predicciones
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Precisión: {accuracy:.2f}")
\`\`\`

## Próximos Pasos

Con esta base, puedes explorar algoritmos más avanzados y datasets más complejos.`,
      slug: 'machine-learning-python-primeros-pasos',
      categoryIndexes: [1], // Ciencia de Datos
      tagIndexes: [0] // JavaScript (relacionado con programación)
    },
    {
      authorIndex: 2, // María
      title: 'Docker y Kubernetes: Desplegando Aplicaciones Modernas',
      content: `En el mundo del desarrollo moderno, la containerización se ha vuelto esencial. Docker y Kubernetes son las herramientas líderes en este espacio.

## Docker: Containerización Simplificada

Docker nos permite empaquetar aplicaciones con todas sus dependencias:

\`\`\`dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Kubernetes: Orquestación de Contenedores

Kubernetes maneja el despliegue y escalado de aplicaciones containerizadas:

\`\`\`yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mi-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mi-app
  template:
    metadata:
      labels:
        app: mi-app
    spec:
      containers:
      - name: mi-app
        image: mi-app:latest
        ports:
        - containerPort: 3000
\`\`\`

## Beneficios de la Containerización

- Portabilidad entre entornos
- Escalabilidad automática
- Gestión simplificada de dependencias
- Despliegues consistentes`,
      slug: 'docker-kubernetes-desplegando-aplicaciones-modernas',
      categoryIndexes: [2], // DevOps
      tagIndexes: [2] // Node.js
    },
    {
      authorIndex: 3, // David
      title: 'Node.js y Express: API REST Completa',
      content: `Crear APIs REST robustas con Node.js y Express es fundamental para el desarrollo backend moderno.

## Configuración Inicial

Empezamos configurando nuestro proyecto:

\`\`\`bash
npm init -y
npm install express mongoose dotenv cors helmet
npm install -D nodemon
\`\`\`

## Estructura del Proyecto

\`\`\`
src/
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  └── app.js
\`\`\`

## Creando el Servidor

\`\`\`javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Servidor corriendo en puerto \${PORT}\`);
});
\`\`\`

## Mejores Prácticas

- Validación de entrada
- Manejo de errores centralizado
- Autenticación JWT
- Rate limiting
- Documentación con Swagger`,
      slug: 'nodejs-express-api-rest-completa',
      categoryIndexes: [0], // Desarrollo Web
      tagIndexes: [0, 2] // JavaScript, Node.js
    },
    {
      authorIndex: 4, // Lucía
      title: 'React Performance: Optimización y Mejores Prácticas',
      content: `La optimización en React es crucial para crear aplicaciones rápidas y responsivas. Exploremos las técnicas más efectivas.

## React.memo: Evitando Re-renders Innecesarios

\`\`\`javascript
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  // Componente que solo se re-renderiza si props cambian
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});
\`\`\`

## useMemo y useCallback: Optimizando Cálculos

\`\`\`javascript
import React, { useMemo, useCallback } from 'react';

function DataTable({ data, filters }) {
  const filteredData = useMemo(() => {
    return data.filter(item => 
      filters.every(filter => filter(item))
    );
  }, [data, filters]);
  
  const handleSort = useCallback((column) => {
    // Lógica de ordenamiento
  }, []);
  
  return (
    <Table 
      data={filteredData} 
      onSort={handleSort} 
    />
  );
}
\`\`\`

## Code Splitting con React.lazy

\`\`\`javascript
import React, { Suspense } from 'react';

const LazyComponent = React.lazy(() => 
  import('./HeavyComponent')
);

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
\`\`\`

## Herramientas de Profiling

- React DevTools Profiler
- Chrome DevTools Performance
- Bundle Analyzer

La optimización debe ser medida, no asumida.`,
      slug: 'react-performance-optimizacion-mejores-practicas',
      categoryIndexes: [0], // Desarrollo Web
      tagIndexes: [0, 1] // JavaScript, React
    }
  ];

  const posts: PostData[] = [];

  for (let i = 0; i < postsData.length; i++) {
    const postData = postsData[i];
    const postIdResult = await conn.query('SELECT gen_random_uuid() as id');
    const id = postIdResult[0].id;

    // Insert post
    await conn.query(`
      INSERT INTO "posts" (
        id, author_id, title, content, slug, status, 
        published_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, now(), now(), now())
    `, [
      id,
      users[postData.authorIndex].id,
      postData.title,
      postData.content,
      postData.slug,
      'published'
    ]);

    // Associate with categories
    for (const categoryIndex of postData.categoryIndexes) {
      await conn.query(`
        INSERT INTO "post_categories" (post_id, category_id)
        VALUES ($1, $2)
      `, [id, categories[categoryIndex].id]);
    }

    // Associate with tags
    for (const tagIndex of postData.tagIndexes) {
      await conn.query(`
        INSERT INTO "post_tags" (post_id, tag_id)
        VALUES ($1, $2)
      `, [id, tags[tagIndex].id]);
    }

    posts.push({
      id,
      authorId: users[postData.authorIndex].id,
      title: postData.title,
      content: postData.content,
      slug: postData.slug,
      categoryIds: postData.categoryIndexes.map(idx => categories[idx].id),
      tagIds: postData.tagIndexes.map(idx => tags[idx].id)
    });
  }

  return posts;
}

async function createPostLikes(conn: any, users: UserData[], posts: PostData[]): Promise<void> {
  // Each user likes all posts except their own
  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    for (let postIndex = 0; postIndex < posts.length; postIndex++) {
      // Skip if it's the user's own post
      if (posts[postIndex].authorId === users[userIndex].id) continue;

      const likeIdResult = await conn.query('SELECT gen_random_uuid() as id');
      const id = likeIdResult[0].id;

      await conn.query(`
        INSERT INTO "post_likes" (id, post_id, user_id, created_at)
        VALUES ($1, $2, $3, now())
      `, [id, posts[postIndex].id, users[userIndex].id]);
    }
  }
}

async function createComments(conn: any, users: UserData[], posts: PostData[]): Promise<any[]> {
  const comments = [];
  
  // Create comment chain: User 1 → Post 2, User 2 → Post 3, etc.
  const commentTexts = [
    "¡Excelente artículo! Me ha ayudado mucho a entender estos conceptos. ¿Podrías profundizar más en los casos de uso avanzados?",
    "Muy clara la explicación. Me gustaría ver un ejemplo más complejo con casos reales de la industria.",
    "Gracias por compartir esto. ¿Has considerado incluir información sobre las mejores prácticas de testing?",
    "Interesante perspectiva. ¿Qué opinas sobre las alternativas que mencionas al final?",
    "Increíble contenido. ¿Tienes planes de hacer una serie sobre este tema?"
  ];

  for (let i = 0; i < users.length; i++) {
    const userIndex = i;
    const postIndex = (i + 1) % posts.length; // Chain pattern
    
    const commentIdResult = await conn.query('SELECT gen_random_uuid() as id');
    const id = commentIdResult[0].id;

    await conn.query(`
      INSERT INTO "comments" (
        id, post_id, author_id, body, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, now(), now())
    `, [
      id,
      posts[postIndex].id,
      users[userIndex].id,
      commentTexts[i]
    ]);

    comments.push({
      id,
      postId: posts[postIndex].id,
      authorId: users[userIndex].id,
      body: commentTexts[i]
    });
  }

  return comments;
}

async function createCommentReplies(conn: any, users: UserData[], comments: any[]): Promise<any[]> {
  const replies = [];
  
  const replyTexts = [
    "¡Gracias por el feedback! Tienes razón, planeo hacer un artículo de seguimiento con casos más avanzados.",
    "Me alegra que te haya resultado útil. Definitivamente el testing es un tema importante que cubriré pronto.",
    "Excelente punto. Las alternativas que mencionas son realmente interesantes, las exploraré en futuros posts.",
    "¡Muchas gracias! Sí, definitivamente planeo hacer una serie completa sobre este tema.",
    "Aprecio mucho tu comentario. Me da ideas para el próximo contenido que voy a crear."
  ];

  for (let i = 0; i < comments.length; i++) {
    // Reply from a different user (next user in cycle)
    const replyAuthorIndex = (i + 1) % users.length;
    
    const replyIdResult = await conn.query('SELECT gen_random_uuid() as id');
    const id = replyIdResult[0].id;

    await conn.query(`
      INSERT INTO "comments" (
        id, post_id, author_id, parent_comment_id, body, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, now(), now())
    `, [
      id,
      comments[i].postId,
      users[replyAuthorIndex].id,
      comments[i].id,
      replyTexts[i]
    ]);

    replies.push({
      id,
      postId: comments[i].postId,
      authorId: users[replyAuthorIndex].id,
      parentCommentId: comments[i].id,
      body: replyTexts[i]
    });
  }

  return replies;
}

async function createCommentLikes(conn: any, users: UserData[], allComments: any[]): Promise<void> {
  // Users who replied also like the original comments and vice versa
  for (const comment of allComments) {
    // Find users who should like this comment (different from author)
    const likingUsers = users.filter(user => user.id !== comment.authorId);
    
    // Each comment gets 1-3 likes from different users
    const numberOfLikes = Math.floor(Math.random() * 3) + 1;
    const selectedUsers = likingUsers.slice(0, numberOfLikes);

    for (const user of selectedUsers) {
      const likeIdResult = await conn.query('SELECT gen_random_uuid() as id');
      const id = likeIdResult[0].id;

      await conn.query(`
        INSERT INTO "comment_likes" (id, comment_id, user_id, created_at)
        VALUES ($1, $2, $3, now())
      `, [id, comment.id, user.id]);
    }
  }
}

// Execute seeding
seedDatabase().catch(err => {
  console.error('❌ Database seeding failed:', err);
  process.exit(1);
});