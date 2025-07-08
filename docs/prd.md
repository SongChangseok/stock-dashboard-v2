# Stock Dashboard - 제품 요구사항 문서 (PRD)

## 1. Product Overview

### 1.1 Vision (비전)
사용자가 직접 입력한 데이터만을 기반으로 주식 포트폴리오를 시각화하고 관리할 수 있는 심플하고 직관적인 대시보드

### 1.2 Core Value Proposition (핵심 가치)
- **심플함 우선**: 복잡한 기능 없이 핵심만 담은 깔끔한 인터페이스
- **사용자 입력 기반**: 모든 데이터를 사용자가 직접 입력하고 관리
- **시각적 포트폴리오**: 명확한 파이차트로 보유 비중 시각화
- **기본적 비교**: 목표 포트폴리오와 현재 포트폴리오 간단 비교

### 1.3 Target Users (타겟 사용자)
- 간단한 포트폴리오 관리를 원하는 개인 투자자
- 수동 데이터 입력을 선호하는 사용자
- 복잡한 기능보다 기본적인 시각화를 원하는 사용자

## 2. Technical Architecture

### 2.1 Technology Stack (기술 스택)
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Authentication, Database, Real-time)
- **Styling**: Tailwind CSS (Spotify 디자인 원칙 기반)
- **State Management**: React Context + useReducer
- **Charts**: Recharts 라이브러리
- **Responsive Design**: Mobile-first 접근법

### 2.2 Database Schema (데이터베이스 스키마)
```sql
-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 주식 보유 테이블
CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stock_name TEXT NOT NULL,
  ticker TEXT, -- 선택사항
  quantity DECIMAL(10,4) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 목표 포트폴리오 테이블
CREATE TABLE target_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  allocations JSONB NOT NULL, -- {"AAPL": 30, "GOOGL": 25, "MSFT": 45}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Feature Requirements (기능 요구사항)

### 3.1 Page 1: Portfolio Overview (포트폴리오 개요)
**핵심 기능:**
- **주식 관리 (Stock Management)**
  - 신규 주식 보유 추가
  - 기존 보유 종목 수정 (종목명, 티커, 수량, 매입가, 현재가)
  - 주식 보유 삭제

- **포트폴리오 시각화 (Portfolio Visualization)**
  - 주식별 비중을 보여주는 파이차트
  - 총 포트폴리오 가치 표시
  - 손익 지표 (절대값 및 퍼센트)
  - 보유 종목 테이블

- **데이터 입력 폼 (Data Input Form)**
  - 종목명 (필수)
  - 티커 심볼 (선택사항)
  - 수량 (필수, 소수점 지원)
  - 주당 매입가 (필수)
  - 주당 현재가 (필수)
  - 총 가치 및 손익 자동 계산

**UI 컴포넌트:**
- 주식 추가용 플로팅 액션 버튼
- 인라인 편집 기능
- 삭제 확인 다이얼로그

### 3.2 Page 2: Portfolio Comparison (포트폴리오 비교)
**핵심 기능:**
- **목표 포트폴리오 설정 (Target Portfolio Setup)**
  - 목표 포트폴리오 생성
  - 각 종목별 목표 비중 설정

- **비교 시각화 (Comparison Visualization)**
  - 현재 vs 목표 포트폴리오 파이차트
  - 비중 차이 표시
  - 편차 표시 (과대/과소 비중)

**UI 컴포넌트:**
- 비교용 듀얼 파이차트
- 비중 입력 슬라이더
- 편차 지표

### 3.3 Page 3: Rebalancing Tools (리밸런싱 도구)
**핵심 기능:**
- **리밸런싱 계산기 (Rebalancing Calculator)**
  - 목표 비중과 현재 비중 비교
  - 필요한 매매 수량 계산 (매수/매도)
  - 간단한 리밸런싱 가이드

**UI 컴포넌트:**
- 매매 수량 표시 카드
- 간단한 리밸런싱 가이드

## 4. Design Requirements (디자인 요구사항)

### 4.1 Design Philosophy (디자인 철학 - Spotify 영감)
- **다크 모드 우선**: 어두운 배경과 생동감 있는 강조 색상
- **Typography**: Pretendard 폰트로 깔끔하고 읽기 쉬운 타이포그래피
- **Color Palette**: 
  - Primary: 깊은 검정과 어두운 회색 (#0A0A0A, #1A1A1A)
  - Accent: 독자적인 브랜드 색상 (#6366F1 - 인디고 블루)
  - Secondary: 배경용 뮤트 색상 (#2D2D2D, #3A3A3A)
  - Status: 손실은 빨강 (#EF4444), 수익은 초록 (#10B981)
- **Spacing**: 충분한 여백, 8px 그리드 시스템
- **Animations**: 미묘한 호버 효과, 부드러운 전환

### 4.2 Responsive Design (반응형 디자인)
- **Mobile First**: 모바일 최적화 (375px+)
- **Tablet**: 태블릿 적응형 레이아웃 (768px+)
- **Desktop**: 완전한 기능 경험 (1024px+)
- **Navigation**: 모바일은 하단 탭, 데스크톱은 사이드바

### 4.3 Component System (컴포넌트 시스템)
- **Cards**: 둥근 모서리, 미묘한 그림자
- **Buttons**: 높은 대비, 명확한 계층 구조
- **Forms**: 플로팅 레이블, 명확한 유효성 검사
- **Charts**: 높은 대비, 접근 가능한 색상
- **Tables**: 얼룩말 줄무늬, 반응형 스크롤

## 5. User Experience Flow (사용자 경험 흐름)

### 5.1 Onboarding (온보딩)
1. Supabase Auth를 통한 계정 생성
2. 앱 개요가 포함된 환영 화면
3. 첫 번째 주식 보유 추가 안내
4. 주요 기능 간단 튜토리얼

### 5.2 Daily Usage (일상 사용)
1. 포트폴리오 가치 빠른 확인
2. 필요시 보유 데이터 수정
3. 비중 vs 목표 검토

### 5.3 Rebalancing Workflow (리밸런싱 워크플로우)
1. 현재 비중 검토
2. 목표와 비교
3. 필요한 매매 수량 확인

## 6. Technical Specifications (기술 사양)

### 6.1 Performance Requirements (성능 요구사항)
- **로딩 시간**: 초기 로딩 < 2초
- **인터랙션**: 응답 시간 < 100ms
- **데이터 업데이트**: Supabase를 통한 실시간
- **오프라인**: 기본 읽기 기능

### 6.2 Security Requirements (보안 요구사항)
- **Authentication**: Supabase Auth (이메일/비밀번호)
- **데이터 프라이버시**: 사용자별 데이터 격리
- **입력 검증**: 클라이언트 및 서버 측 검증
- **사용자 입력 기반**: 모든 데이터는 사용자가 직접 입력하여 관리

### 6.3 Browser Support (브라우저 지원)
- **모던 브라우저**: Chrome 90+, Firefox 88+, Safari 14+
- **모바일**: iOS Safari 14+, Android Chrome 90+
- **Features**: ES2020, CSS Grid, Flexbox

## 7. Success Metrics (성공 지표)

### 7.1 User Engagement (사용자 참여)
- 일일 활성 사용자 (DAU)
- 세션 지속 시간
- 기능 채택률
- 사용자 유지율 (7일, 30일)

### 7.2 Functionality (기능성)
- 포트폴리오 생성 완료율
- 리밸런싱 도구 사용률
- 데이터 정확성 (사용자 보고 이슈)
- 성능 벤치마크

## 8. Development Phases (개발 단계)

### Phase 1: MVP (4-6주)
- 주식 기본 CRUD 기능
- 간단한 파이차트 시각화
- 사용자 인증
- 모바일 반응형 디자인

### Phase 2: 비교 기능 (2-3주)
- 목표 포트폴리오 설정
- 비교 시각화
- 데스크톱 최적화

### Phase 3: 리밸런싱 (2-3주)
- 리밸런싱 계산기
- 매매 수량 계산
- 성능 최적화

### Phase 4: Polish & Launch (1-2주)
- 사용자 테스트 피드백 적용
- 성능 최적화
- 배포 준비

## 9. Constraints & Assumptions (제약사항 & 가정)

### 9.1 Constraints (제약사항)
- 실시간 시장 데이터 통합 없음
- 자동 거래 기능 없음
- 세금 계산 기능 없음 (초기 버전)
- 다중 통화 지원 없음 (초기 버전)

### 9.2 Assumptions (가정)
- 사용자가 현재가를 수동으로 업데이트
- 사용자가 기본적인 포트폴리오 개념 이해
- 사용자가 모던 웹브라우저에 접근 가능
- 사용자가 복잡한 기능보다 단순함을 선호

## 10. Future Enhancements (향후 개선사항)

### 10.1 Potential Features (잠재적 기능)
- 시장 데이터 API 통합
- 포트폴리오 성과 추적
- 세금 손실 수확 도구
- 다중 통화 지원
- 소셜 공유 기능
- 세무 소프트웨어 연동

### 10.2 Scalability Considerations (확장성 고려사항)
- 사용자 기반 성장 계획
- 데이터베이스 최적화
- CDN 구현
- 고급 캐싱 전략

---

## 추가 고려사항 (Additional Considerations)

### 사용성 개선사항
- **빠른 입력**: 자주 사용하는 종목 즐겨찾기
- **데이터 백업**: 로컬 저장소 백업 기능
- **알림 기능**: 리밸런싱 필요 시점 알림
- **교육 콘텐츠**: 포트폴리오 이론 간단 가이드

### 브랜딩 및 시각 디자인
- **독자적 색상 체계**: 인디고 블루 (#6366F1)를 메인 액센트로 사용
- **일관된 브랜딩**: 로고, 아이콘 등 통일성 있는 디자인
- **다크 테마 최적화**: 눈의 피로를 줄이는 색상 조합