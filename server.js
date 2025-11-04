/**
 * Joe Learn Backend Server
 *
 * This is the main server file for the application. It sets up an Express server,
 * configures middleware (CORS, JSON parsing), and defines all API endpoints.
 * NOTE: Environment variables are no longer used from a .env file.
 * Firebase credentials are loaded from `serviceAccountKey.json`.
 * Cloudinary credentials are now hardcoded in `cloudinaryConfig.js`.
 */

const express = require('express');
const cors = require('cors');
const { db } = require('./firebaseConfig'); // This now handles Firebase initialization
const { cloudinary } = require('./cloudinaryConfig'); // uploadVideo and uploadAssessment are no longer needed here
const { FieldValue } = require('firebase-admin/firestore');

const app = express();
const PORT = process.env.PORT || 8000;

// === Middleware ===
app.use(cors());
app.use(express.json());

// Simple request logger to help with debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Received ${req.method} request for ${req.originalUrl}`);
    next();
});

// API Router
const apiRouter = express.Router();

// Health Check Endpoint
apiRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'Joe Learn API is running!' });
});

// POST /api/generate-signature - Generate a signature for direct Cloudinary upload
apiRouter.post('/generate-signature', (req, res) => {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    
    // Parameters to sign. The folder is sent from the frontend.
    const params_to_sign = {
        timestamp: timestamp,
        ...req.body 
    };

    try {
        const signature = cloudinary.utils.api_sign_request(params_to_sign, cloudinary.config().api_secret);
        res.status(200).json({
            signature: signature,
            timestamp: timestamp,
            api_key: cloudinary.config().api_key,
            cloud_name: cloudinary.config().cloud_name
        });
    } catch (error) {
        console.error('Error generating Cloudinary signature:', error);
        res.status(500).json({ message: 'Could not generate upload signature.' });
    }
});


// === Video Endpoints ===

// GET /api/videos - Fetch all videos
apiRouter.get('/videos', async (req, res, next) => {
  try {
    const videosSnapshot = await db.collection('videos').orderBy('createdAt', 'desc').get();
    const videos = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    next(error);
  }
});

// POST /api/upload-video - Save video metadata after successful direct upload
apiRouter.post('/upload-video', async (req, res, next) => {
  try {
    const { title, teacherName, subject, url, public_id, duration } = req.body;
    if (!title || !teacherName || !subject || !url || !public_id || duration === undefined) {
      return res.status(400).json({ message: 'Missing required video data.' });
    }

    const newVideoData = {
      title,
      subject,
      teacher: teacherName,
      url,
      public_id,
      duration,
      views: 0,
      completions: 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('videos').add(newVideoData);
    // Return a complete object with the new ID and a usable timestamp
    const newVideo = { id: docRef.id, ...newVideoData, createdAt: new Date().toISOString() };
    res.status(201).json(newVideo);

  } catch (error) {
    console.error('Error saving video metadata:', error);
    next(error);
  }
});

// POST /api/videos/:id/view - Increment video view count
apiRouter.post('/videos/:id/view', async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const videoRef = db.collection('videos').doc(videoId);
        await videoRef.update({ views: FieldValue.increment(1) });
        res.status(200).json({ message: 'View count updated successfully.' });
    } catch (error) {
        console.error('Error updating view count:', error);
        next(error);
    }
});

// POST /api/videos/:id/complete - Increment video completion count
apiRouter.post('/videos/:id/complete', async (req, res, next) => {
    try {
        const videoId = req.params.id;
        const videoRef = db.collection('videos').doc(videoId);
        await videoRef.update({ completions: FieldValue.increment(1) });
        res.status(200).json({ message: 'Completion count updated successfully.' });
    } catch (error)
    {
        console.error('Error updating completion count:', error);
        next(error);
    }
});


// === Assessment Endpoints ===

// GET /api/assessments - Fetch all assessments
apiRouter.get('/assessments', async (req, res, next) => {
    try {
        const assessmentsSnapshot = await db.collection('assessments').orderBy('createdAt', 'desc').get();
        const assessments = assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        next(error);
    }
});

// POST /api/upload-assessment - Save assessment metadata after successful direct upload
apiRouter.post('/upload-assessment', async (req, res, next) => {
    try {
        const { title, teacherName, url, public_id } = req.body;
        if (!title || !teacherName || !url || !public_id) {
            return res.status(400).json({ message: 'Missing required assessment data.' });
        }
        const newAssessmentData = {
            title,
            teacher: teacherName,
            url,
            public_id,
            createdAt: FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('assessments').add(newAssessmentData);
        const newAssessment = { id: docRef.id, ...newAssessmentData, createdAt: new Date().toISOString() };
        res.status(201).json(newAssessment);
    } catch (error) {
        console.error('Error saving assessment metadata:', error);
        next(error);
    }
});


// PUT /api/assessments/:id - Update assessment title
apiRouter.put('/assessments/:id', async (req, res, next) => {
    try {
        const assessmentId = req.params.id;
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'New title is required.' });
        }
        const assessmentRef = db.collection('assessments').doc(assessmentId);
        await assessmentRef.update({ title });
        res.status(200).json({ message: 'Assessment updated successfully.' });
    } catch (error) {
        console.error('Error updating assessment:', error);
        next(error);
    }
});


// DELETE /api/assessments/:id - Delete an assessment
apiRouter.delete('/assessments/:id', async (req, res, next) => {
    try {
        const assessmentId = req.params.id;
        const assessmentRef = db.collection('assessments').doc(assessmentId);
        const doc = await assessmentRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Assessment not found.' });
        }

        const public_id = doc.data().public_id;

        // Delete from Cloudinary
        if (public_id) {
            await cloudinary.uploader.destroy(public_id, { resource_type: 'raw' });
        }

        // Delete from Firestore
        await assessmentRef.delete();
        
        res.status(200).json({ message: 'Assessment deleted successfully.' });
    } catch (error) {
        console.error('Error deleting assessment:', error);
        next(error);
    }
});

// Use the API router with a prefix
app.use('/api', apiRouter);

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error('An unhandled error occurred:', err.stack);
  res.status(500).json({ message: 'An internal server error occurred. Please check the server logs for details.' });
});


// === Server Start ===
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
