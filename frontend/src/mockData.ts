import { Question } from './types';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "소프트웨어 설계",
    text: "디자인 패턴 중 생성 패턴에 해당하지 않는 것은?",
    options: [
      "Abstract Factory",
      "Builder",
      "Singleton",
      "Adapter"
    ],
    correctAnswer: 3
  },
  {
    id: 2,
    subject: "소프트웨어 설계",
    text: "UML 다이어그램 중 정적 다이어그램에 해당하는 것은?",
    options: [
      "Sequence Diagram",
      "State Chart Diagram",
      "Class Diagram",
      "Activity Diagram"
    ],
    correctAnswer: 2
  },
  {
    id: 3,
    subject: "소프트웨어 설계",
    text: "애자일(Agile) 방법론의 핵심 가치가 아닌 것은?",
    options: [
      "개인과 상호작용",
      "실행 가능한 소프트웨어",
      "고객과의 협력",
      "계획에 따른 엄격한 수행"
    ],
    correctAnswer: 3
  },
  {
    id: 4,
    subject: "소프트웨어 개발",
    text: "화이트박스 테스트 기법이 아닌 것은?",
    options: [
      "데이터 흐름 검사",
      "루프 검사",
      "경계값 분석",
      "기초 경로 검사"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    subject: "소프트웨어 개발",
    text: "형상 관리(Configuration Management)의 절차가 아닌 것은?",
    options: [
      "형상 식별",
      "형상 통제",
      "형상 감사",
      "형상 폐기"
    ],
    correctAnswer: 3
  },
  {
    id: 6,
    subject: "데이터베이스 구축",
    text: "데이터베이스 설계 순서로 옳은 것은?",
    options: [
      "개념적 설계 -> 논리적 설계 -> 물리적 설계",
      "논리적 설계 -> 개념적 설계 -> 물리적 설계",
      "물리적 설계 -> 개념적 설계 -> 논리적 설계",
      "개념적 설계 -> 물리적 설계 -> 논리적 설계"
    ],
    correctAnswer: 0
  },
  {
    id: 7,
    subject: "데이터베이스 구축",
    text: "SQL에서 DDL(Data Definition Language)에 해당하지 않는 명령어는?",
    options: [
      "CREATE",
      "ALTER",
      "DROP",
      "SELECT"
    ],
    correctAnswer: 3
  },
  {
    id: 8,
    subject: "프로그래밍 언어 활용",
    text: "OSI 7계층 중 전송 계층(Transport Layer)의 프로토콜은?",
    options: [
      "HTTP",
      "TCP",
      "IP",
      "Ethernet"
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    subject: "프로그래밍 언어 활용",
    text: "C언어에서 변수 선언 시 지켜야 할 규칙이 아닌 것은?",
    options: [
      "영문자, 숫자, 언더바(_)를 사용할 수 있다.",
      "첫 글자는 숫자로 시작할 수 없다.",
      "대소문자를 구분하지 않는다.",
      "예약어는 변수명으로 사용할 수 없다."
    ],
    correctAnswer: 2
  },
  {
    id: 10,
    subject: "정보시스템 구축 관리",
    text: "침입 차단 시스템(Firewall)의 주요 기능이 아닌 것은?",
    options: [
      "접근 제어",
      "사용자 인증",
      "데이터 암호화",
      "감사 및 추적"
    ],
    correctAnswer: 2
  },
  // 11-20번은 반복적인 데이터로 채움 (실제 구현 시에는 더 다양하게)
  {
    id: 11,
    subject: "소프트웨어 설계",
    text: "객체지향 설계 원칙(SOLID) 중 'S'가 의미하는 것은?",
    options: [
      "Single Responsibility Principle",
      "Static Relationship Principle",
      "System Recovery Principle",
      "Software Reuse Principle"
    ],
    correctAnswer: 0
  },
  {
    id: 12,
    subject: "소프트웨어 개발",
    text: "결합도(Coupling)가 가장 낮은 것은?",
    options: [
      "Content Coupling",
      "Common Coupling",
      "Control Coupling",
      "Data Coupling"
    ],
    correctAnswer: 3
  },
  {
    id: 13,
    subject: "데이터베이스 구축",
    text: "제 1정규형(1NF)의 조건은?",
    options: [
      "모든 도메인이 원자값이어야 한다.",
      "부분 함수적 종속성을 제거해야 한다.",
      "이행적 함수적 종속성을 제거해야 한다.",
      "결정자가 후보키가 아닌 함수적 종속성을 제거해야 한다."
    ],
    correctAnswer: 0
  },
  {
    id: 14,
    subject: "프로그래밍 언어 활용",
    text: "Python에서 리스트에 요소를 추가하는 메서드는?",
    options: [
      "add()",
      "push()",
      "append()",
      "insert_last()"
    ],
    correctAnswer: 2
  },
  {
    id: 15,
    subject: "정보시스템 구축 관리",
    text: "클라우드 컴퓨팅 서비스 모델 중 인프라를 제공하는 모델은?",
    options: [
      "SaaS",
      "PaaS",
      "IaaS",
      "DaaS"
    ],
    correctAnswer: 2
  },
  {
    id: 16,
    subject: "소프트웨어 설계",
    text: "미들웨어(Middleware)의 종류가 아닌 것은?",
    options: [
      "RPC",
      "MOM",
      "ORB",
      "GUI"
    ],
    correctAnswer: 3
  },
  {
    id: 17,
    subject: "소프트웨어 개발",
    text: "응집도(Cohesion)가 가장 높은 것은?",
    options: [
      "Functional Cohesion",
      "Sequential Cohesion",
      "Communicational Cohesion",
      "Procedural Cohesion"
    ],
    correctAnswer: 0
  },
  {
    id: 18,
    subject: "데이터베이스 구축",
    text: "트랜잭션의 특성 중 원자성(Atomicity)을 설명하는 것은?",
    options: [
      "트랜잭션의 연산은 모두 반영되거나 전혀 반영되지 않아야 한다.",
      "트랜잭션 실행 전후의 데이터베이스 상태는 일관되어야 한다.",
      "둘 이상의 트랜잭션이 동시에 실행될 때 서로 간섭할 수 없다.",
      "성공적으로 완료된 트랜잭션의 결과는 영구적으로 반영되어야 한다."
    ],
    correctAnswer: 0
  },
  {
    id: 19,
    subject: "프로그래밍 언어 활용",
    text: "자바(Java)에서 상속을 구현할 때 사용하는 키워드는?",
    options: [
      "implements",
      "extends",
      "inherits",
      "super"
    ],
    correctAnswer: 1
  },
  {
    id: 20,
    subject: "정보시스템 구축 관리",
    text: "암호화 알고리즘 중 대칭키 암호화 방식이 아닌 것은?",
    options: [
      "DES",
      "AES",
      "SEED",
      "RSA"
    ],
    correctAnswer: 3
  }
];
