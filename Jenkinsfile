pipeline {
    agent any

    environment {
        IMAGE_NAME = 'medtrack-api'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        EC2_HOST   = 'ec2-user@54.253.181.6'
    }

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Code Quality') {
            steps {
                withSonarQubeEnv('LocalSonarQube') {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=medtrack-api \
                        -Dsonar.sources=.
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Security') {
            steps {
                sh 'npm audit --audit-level=critical'
                sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity CRITICAL --ignore-unfixed --exit-code 1 ${IMAGE_NAME}:${IMAGE_TAG}'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh 'docker rm -f medtrack-staging || true'
                    sh 'docker run -d --name medtrack-staging -p 3001:3000 ${IMAGE_NAME}:${IMAGE_TAG}'
                    sh 'sleep 8'
                    sh 'docker logs medtrack-staging || true'
                    try {
                        sh 'curl -f http://host.docker.internal:3001/health'
                        echo 'Staging health check passed'
                        sh 'docker rm -f medtrack-staging || true'
                        sh 'docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:previous'
                    } catch (err) {
                        echo 'Staging health check FAILED - rolling back to previous image'
                        sh 'docker logs medtrack-staging || true'
                        sh 'docker rm -f medtrack-staging || true'
                        sh 'docker rm -f medtrack-staging-rollback || true'
                        sh 'docker run -d --name medtrack-staging-rollback -p 3001:3000 ${IMAGE_NAME}:previous || true'
                        error('Deploy stage failed health check - rolled back to previous image')
                    }
                }
            }
        }

        stage('Release') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        docker save ${IMAGE_NAME}:${IMAGE_TAG} -o image.tar
                        scp -i $SSH_KEY -o StrictHostKeyChecking=no image.tar ${EC2_HOST}:~/image.tar
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${EC2_HOST} "sudo docker load -i ~/image.tar"
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${EC2_HOST} "sudo pkill -f '[n]ode server.js' || true"
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${EC2_HOST} "sudo fuser -k 3000/tcp || true"
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${EC2_HOST} "sudo docker rm -f medtrack-api-prod || true"
                        sleep 2
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${EC2_HOST} "sudo docker run -d --name medtrack-api-prod -p 3000:3000 --restart unless-stopped ${IMAGE_NAME}:${IMAGE_TAG}"
                        rm -f image.tar
                    '''
                }
            }
        }

        stage('Monitoring') {
            steps {
                withCredentials([string(credentialsId: 'datadog-api-key', variable: 'DD_API_KEY')]) {
                    sh '''
                        sleep 5
                        curl -f http://54.253.181.6:3000/health
                        curl -X POST "https://api.ap2.datadoghq.com/api/v1/events" \
                        -H "DD-API-KEY: $DD_API_KEY" \
                        -H "Content-Type: application/json" \
                        -d '{"title": "MedTrack API Deployed", "text": "Jenkins pipeline successfully deployed and verified medtrack-api on AWS EC2", "alert_type": "success"}'
                    '''
                }
            }
        }
    }
}