# 영진전문대학교 회원관리 데이터베이스 설계서

이 문서는 영진전문대학교 회원가입 페이지에서 입력받는 회원 정보를 관리하기 위한 데이터베이스(DB) 설계 요약서입니다.

---

## 1. 테이블 정의 (Table Definition)

### 테이블명: `members` (회원 테이블)
시스템에 가입한 사용자(학생/교직원 등)의 고유 계정 정보 및 연락처를 관리하는 테이블입니다.

| 컬럼 순서 | 논리명 (한글) | 물리명 (컬럼명) | 데이터 타입 (Data Type) | 제약 조건 (Constraints) | 설명 |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | 일련번호 | `id` (또는 `number`) | `BIGINT` | **PRIMARY KEY**, **AUTO_INCREMENT** | 시스템에서 자동으로 부여되는 회원 고유 번호 (1부터 순차 증가) |
| **2** | 로그인 아이디 | `username` | `VARCHAR(20)` | **UNIQUE**, **NOT NULL** | 영문/숫자 조합의 고유 식별 아이디 (중복 허용 안 됨) |
| **3** | 비밀번호 | `password` | `VARCHAR(255)` | **NOT NULL** | 안전하게 암호화(예: SHA-256, bcrypt 등)된 비밀번호 해시값 |
| **4** | 이메일 주소 | `email` | `VARCHAR(100)` | **NOT NULL** | 이메일 유효성 형식을 갖춘 연락 수단 |
| **5** | 휴대전화번호 | `phone` | `VARCHAR(15)` | **NOT NULL** | 하이픈(-) 포함 형식(예: 010-1234-5678)의 연락처 |
| **6** | 가입일시 | `created_at` | `DATETIME` | **DEFAULT CURRENT_TIMESTAMP** | 회원 가입이 완료된 시스템 기준 날짜 및 시간 |
| **7** | 수정일시 | `updated_at` | `DATETIME` | **DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP** | 회원 정보가 최근 변경된 날짜 및 시간 |

---

## 2. 컬럼 상세 및 제약 조건 설명 (Column Details)

1. **`id` (number)**
   - 데이터가 추가될 때마다 1부터 자동으로 1씩 증가하는 고유 번호입니다.
   - 관계형 데이터베이스에서 레코드를 고유하게 식별하기 위한 **기본키(Primary Key)** 역할을 수행합니다.

2. **`username` (아이디)**
   - 영문 소문자 및 숫자로 이루어진 4자 이상 20자 이하의 고유 문자열입니다.
   - 중복 가입을 방지하기 위해 **UNIQUE** 제약 조건이 설정되어야 합니다.

3. **`password` (비밀번호)**
   - 보안 가이드라인에 따라 평문(Plain Text)으로 절대 저장하지 않으며, 단방향 해시 함수(예: **bcrypt**, **Argon2**, 또는 최소 **SHA-256**)를 통해 암호화된 해시값을 저장합니다.
   - 암호화된 문자열의 길이를 고려하여 충분한 크기(`VARCHAR(255)`)로 설정합니다.

4. **`email` (이메일)**
   - 사용자가 비밀번호를 분실했거나 인증 메일을 수신하기 위한 용도로 활용됩니다.
   - 형식 검증(Regular Expression)을 통과한 문자열만 저장됩니다.

5. **`phone` (전화번호)**
   - 국내 휴대전화번호 표준 포맷(`010-XXXX-XXXX`)을 따르며, 통계나 정렬을 위해 하이픈을 포함한 문자열 상태로 저장하거나 필요에 따라 숫자만 추출하여 저장할 수 있습니다.

---

## 3. SQL 테이블 생성 스크립트 (DDL)

데이터베이스 구축 시 즉시 사용할 수 있는 표준 MySQL/MariaDB 호환 DDL 스크립트입니다.

```sql
CREATE TABLE `members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '회원 고유 일련번호',
  `username` VARCHAR(20) NOT NULL COMMENT '로그인 아이디',
  `password` VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호 해시값',
  `email` VARCHAR(100) NOT NULL COMMENT '이메일 주소',
  `phone` VARCHAR(15) NOT NULL COMMENT '전화번호 (예: 010-1234-5678)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입 일시',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원 정보 테이블';
```

---

## 4. 인덱스(Index) 설계

빠른 조회 및 데이터 무결성 검증을 위해 인덱스를 다음과 같이 설정합니다.

- **`PRIMARY`**: `id` 필드에 자동 생성되며 클러스터형 인덱스(Clustered Index)로 작동합니다.
- **`uk_username` (Unique Index)**: 로그인 프로세스에서 아이디 존재 여부를 빈번하게 대조하므로 빠른 검색 속도를 위해 유니크 인덱스로 추가 설정합니다.
