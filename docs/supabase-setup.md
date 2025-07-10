# Supabase 설정 가이드

## 로컬 개발 환경 설정

### 1. Docker 설치 및 실행
Docker Desktop이 설치되어 있고 실행 중이어야 합니다.

### 2. Supabase 로컬 환경 시작
```bash
npm run supabase:start
```

이 명령어는 다음을 실행합니다:
- PostgreSQL 데이터베이스 시작
- Supabase API 서버 시작
- Supabase Studio (관리 패널) 시작
- 인증 및 실시간 서비스 시작

### 3. 데이터베이스 스키마 적용
migrations 폴더의 SQL 파일들이 자동으로 적용됩니다.

### 4. 타입 생성
```bash
npm run supabase:types
```

이 명령어는 데이터베이스 스키마에서 TypeScript 타입을 자동 생성합니다.

### 5. 개발 서버 시작
```bash
npm run dev
```

## 로컬 환경 URL

- **애플리케이션**: http://localhost:5173
- **Supabase API**: http://127.0.0.1:54321
- **Supabase Studio**: http://127.0.0.1:54323
- **데이터베이스**: localhost:54322

## 환경 변수

로컬 개발용 환경 변수는 `.env.local` 파일에 설정되어 있습니다:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## 프로덕션 환경 설정

### 1. Supabase 프로젝트 생성
1. https://supabase.com 에서 새 프로젝트 생성
2. 프로젝트 URL과 anon key 복사

### 2. 환경 변수 설정
`.env.local` 파일에 프로덕션 값으로 업데이트:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 데이터베이스 마이그레이션 적용
```bash
npx supabase db push
```

## 데이터베이스 스키마

### 테이블 구조

#### profiles
- 사용자 프로필 정보
- auth.users와 1:1 관계
- RLS 정책 적용

#### stocks
- 주식 보유 정보
- 사용자별 주식 종목, 수량, 가격 정보
- RLS 정책 적용

#### target_portfolios
- 목표 포트폴리오 설정
- JSONB 형태로 배분 비율 저장
- RLS 정책 적용

### RLS (Row Level Security) 정책
모든 테이블에 사용자별 데이터 접근 제한 정책이 적용되어 있습니다.

## 유틸리티 명령어

```bash
# Supabase 로컬 환경 중지
npm run supabase:stop

# 데이터베이스 초기화 (모든 데이터 삭제)
npm run supabase:reset

# 타입 재생성
npm run supabase:types
```

## 테스트

애플리케이션을 실행하면 DatabaseTest 컴포넌트가 표시되어 다음을 테스트할 수 있습니다:
- 데이터베이스 연결 상태
- 사용자 인증 (회원가입, 로그인, 로그아웃)
- 기본적인 API 호출

## 트러블슈팅

### Docker 관련 문제
- Docker Desktop이 실행 중인지 확인
- Docker 리소스 할당량 확인 (최소 2GB RAM 권장)

### 포트 충돌 문제
- 기본 포트들이 이미 사용 중인 경우 `supabase/config.toml`에서 포트 변경 가능

### 마이그레이션 문제
- 마이그레이션 파일 순서 확인
- SQL 문법 오류 확인
- `npx supabase db reset`으로 초기화 후 재시도