# Redmine Clone

이슈/티켓 관리, 프로젝트 관리, 간트차트, 위키를 갖춘 경량 프로젝트 관리 도구.

- **Frontend**: React 18 + Vite 5 + TypeScript + Tailwind CSS
- **Backend**: Java 17 + Spring Boot 3.2 + SQLite (JPA)
- **인증**: username/password → JWT (localStorage)
- **간트차트**: frappe-gantt

## 주요 기능

| 기능 | 설명 |
|------|------|
| 프로젝트 | 프로젝트 CRUD, 멤버 관리 |
| 이슈 | 트래커(BUG/FEATURE/TASK)·상태·우선순위·담당자·기간·진행률, 필터링 |
| 간트차트 | 이슈 시작일/마감일/진행률 기반 타임라인 |
| 위키 | 프로젝트별 마크다운 문서 |

## 로컬 실행

전제: Node 20, Java 17

```bash
# 백엔드 (http://localhost:8080)
cd backend && ./gradlew bootRun

# 프론트엔드 (http://localhost:5173, /api → 8080 프록시)
cd frontend && npm install && npm run dev
```

기본 계정: `admin` / `admin`

## 디렉토리

```
backend/    Spring Boot (auth/user/project/issue/milestone/wiki)
frontend/   React SPA (api/auth/components/pages)
```

## 배포 (홈서버 자동 배포)

`main` 브랜치에 push 하면 GitHub Actions(`.github/workflows/deploy.yml`)가
SSH로 홈서버에 접속해 자동 배포한다.

- 프론트엔드: `npm run build` → nginx가 `frontend/dist` 를 `/redmine/` 경로로 정적 서빙
- 백엔드: `./gradlew bootJar` → PM2 `redmine-backend` (prod 프로파일, 포트 8082),
  nginx가 `/redmine-api/` → `127.0.0.1:8082/api/` 로 프록시
- 운영 URL: `https://mandoo1027.tplinkdns.com/redmine/`

### 배포 키 설정

GitHub 레포 Settings → Secrets → Actions 에 `SSH_PRIVATE_KEY` (서버 `~/.ssh/gha_deploy_key`) 등록.

### 프로덕션 환경 변수

- `REDMINE_JWT_SECRET`: JWT 서명 키 (미설정 시 개발용 기본값 사용)
