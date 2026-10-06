// ============================================================
// BloodLife - Jenkins Pipeline (Declarative)
// ============================================================
// This file tells Jenkins how to build and deploy the app.
// Triggered on git push (via webhook) or manually.
//
// Pipeline stages:
//   1. Checkout       — Jenkins auto-clones the repo
//   2. Prepare Env    — Writes .env from Jenkins credentials
//   3. Build Backend  — docker compose build backend
//   4. Build Frontend — docker compose build frontend
//   5. Deploy         — docker compose up -d
//   6. Health Check   — curl /api/health
// ============================================================

pipeline {
    // Run on any available agent (we have 1 Jenkins node)
    agent any

    // --------------------------------------------------------
    // ENVIRONMENT VARIABLES
    // --------------------------------------------------------
    // Secrets come from Jenkins credentials (configured in UI)
    // VITE_API_URL is the public URL users will access the app on
    // --------------------------------------------------------
    environment {
        MONGO_URI       = credentials('bloodlife-mongo-uri')
        JWT_SECRET      = credentials('bloodlife-jwt-secret')
        JWT_EXPIRES_IN  = '7d'
        NODE_ENV        = 'production'
        VITE_API_URL    = 'http://13.54.125.121/api'
    }

    // --------------------------------------------------------
    // PIPELINE STAGES
    // --------------------------------------------------------
    stages {

        // ----------------------------------------------------
        // STAGE 1: CHECKOUT
        // ----------------------------------------------------
        // Jenkins automatically checks out the code when
        // using "Pipeline script from SCM" — no explicit step needed.
        // ----------------------------------------------------
        stage('Checkout') {
            steps {
                echo '📥 Code checked out from GitHub'
                sh 'pwd && ls -la'
            }
        }

        // ----------------------------------------------------
        // STAGE 2: PREPARE ENVIRONMENT
        // ----------------------------------------------------
        // Writes the .env file that docker-compose.yml reads.
        // This file is NOT committed to Git — it's created
        // fresh on each build from Jenkins credentials.
        // ----------------------------------------------------
       stage('Prepare Environment') {
    steps {
        echo '🔐 Writing .env file from credentials'
        sh '''
            cat > .env <<EOF
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
NODE_ENV=${NODE_ENV}
VITE_API_URL=${VITE_API_URL}
EOF
            echo '✅ .env created'
            echo "VITE_API_URL in .env: $(grep VITE_API_URL .env)"
            ls -la .env
        '''
    }
}

        // ----------------------------------------------------
        // STAGE 3: BUILD BACKEND
        // ----------------------------------------------------
        stage('Build Backend') {
            steps {
                echo '🔨 Building backend Docker image...'
                sh 'docker compose build backend'
                echo '✅ Backend image built'
            }
        }

        // ----------------------------------------------------
        // STAGE 4: BUILD FRONTEND
        // ----------------------------------------------------
        stage('Build Frontend') {
            steps {
                echo '🔨 Building frontend Docker image...'
                sh 'docker compose build frontend'
                echo '✅ Frontend image built'
            }
        }

        // ----------------------------------------------------
        // STAGE 5: DEPLOY
        // ----------------------------------------------------
        // Stop old containers, start new ones.
        // --remove-orphans cleans up any leftover containers.
        // ----------------------------------------------------
        stage('Deploy') {
    steps {
        echo '🚀 Deploying new containers...'
        sh 'docker compose down --remove-orphans || true'
        sh 'docker compose up -d --build'
        echo '✅ Containers started'
        sh 'docker compose ps'
    }
}

        // ----------------------------------------------------
        // STAGE 6: HEALTH CHECK
        // ----------------------------------------------------
        // Wait for backend to boot, then hit /api/health.
        // If it fails, the pipeline fails — protecting us
        // from deploying broken builds.
        // ----------------------------------------------------
        stage('Health Check') {
            steps {
                echo '🏥 Checking backend health...'
                sh '''
                    sleep 15
                    curl -f http://localhost:5000/api/health || exit 1
                '''
                echo '✅ Backend is healthy'
            }
        }
    }

    // --------------------------------------------------------
    // POST-ACTIONS
    // --------------------------------------------------------
    post {
        success {
            echo '🎉 Deployment successful!'
            echo '🌐 App is live at http://13.54.125.121'
        }
        failure {
            echo '❌ Deployment failed. Check logs above.'
        }
        always {
            echo '🧹 Cleaning up workspace...'
            sh 'rm -f .env || true'
        }
    }
}