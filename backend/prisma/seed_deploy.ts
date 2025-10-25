import { PoseDifficulty, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('발레 자세 데이터를 추가합니다...');

  const balletPoses = [
    // BEGINNER (초급) 자세
    {
      name: '쁠리에 (Plié)',
      description: '무릎을 구부리는 동작 (Demi-plié: 반만, Grand plié: 완전히)',
      difficulty: 'BEGINNER',
    },
    {
      name: '땅뒤 (Tendu)',
      description: '발끝을 밀어 펴서 다리를 곧게 뻗는 동작',
      difficulty: 'BEGINNER',
    },
    {
      name: '데가제 (Dégagé)',
      description: '땅뒤에서 발을 바닥에서 살짝 들어 올리는 동작',
      difficulty: 'BEGINNER',
    },
    {
      name: '롱드잠 아 떼르 (Rond de jambe à terre)',
      description: '발끝을 바닥에 붙인 채 원을 그리는 동작',
      difficulty: 'BEGINNER',
    },
    {
      name: '폰듀 (Fondu)',
      description:
        "지지하는 다리와 움직이는 다리를 함께 '녹이듯이' 구부리고 펴는 동작",
      difficulty: 'BEGINNER',
    },
    {
      name: '쿠드피에 (Cou-de-pied)',
      description: '한쪽 발목에 다른 쪽 발을 감싸듯이 놓는 기본 위치',
      difficulty: 'BEGINNER',
    },
    {
      name: '파세 (Passé)',
      description:
        '다리를 구부려 발끝을 무릎 옆에 놓는 자세 (다른 동작의 연결)',
      difficulty: 'BEGINNER',
    },
    {
      name: '포르 드 브라 (Port de bras)',
      description: '팔을 움직이는 동작 및 자세 (팔의 운용)',
      difficulty: 'BEGINNER',
    },
    {
      name: '를르베 (Relevé)',
      description: '발볼 또는 발끝으로 올라서는 동작',
      difficulty: 'BEGINNER',
    },
    {
      name: '쏘떼 (Sauté)',
      description: '두 발로 뛰어 두 발로 착지하는 모든 점프의 기본',
      difficulty: 'BEGINNER',
    },
    {
      name: '샹즈망 드 피에 (Changement de pieds)',
      description: '점프 중 공중에서 다리 위치를 바꾸는 동작 (5번에서 5번으로)',
      difficulty: 'BEGINNER',
    },
    {
      name: '글리사드 (Glissade)',
      description: '미끄러지듯 이동하며 다음 동작으로 연결하는 스텝',
      difficulty: 'BEGINNER',
    },
    {
      name: '피케 (Piqué)',
      description: "한 발로 '찌르듯이' 중심을 이동하여 발끝으로 서는 스텝",
      difficulty: 'BEGINNER',
    },
    {
      name: '파 드 부레 (Pas de bourrée)',
      description: '세 번의 작은 이동 스텝으로 동작을 연결하는 동작',
      difficulty: 'BEGINNER',
    },
    {
      name: '크루아제 (Croisé)',
      description: '다리가 교차되어 보이는 방향',
      difficulty: 'BEGINNER',
    },
    {
      name: '앙 파스 (En Face)',
      description: '정면을 바라보는 방향',
      difficulty: 'BEGINNER',
    },
    {
      name: '탐 레베 (Temps levé)',
      description: '한 발 또는 두 발로 뛰는 작은 홉(hop) 점프',
      difficulty: 'BEGINNER',
    },
    {
      name: '에샤페 쏘떼 (Échappé sauté)',
      description: '닫힌 자세에서 열린 자세로 발을 바꾸는 점프',
      difficulty: 'BEGINNER',
    },

    // INTERMEDIATE (중급) 자세
    {
      name: '프라페 (Frappé)',
      description: '발목 주변에서 발을 빠르게 펴서 바닥에서 떼는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '데벨로페 (Développé)',
      description: '파세 자세를 거쳐 다리를 펼쳐 올리는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '그랑 바뜨망 (Grand battement)',
      description: '다리를 힘차게 높이 차 올리는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '깜브레 (Cambré)',
      description: '상체를 뒤로 또는 옆으로 활처럼 휘게 구부리는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '아라베스크 (Arabesque)',
      description: '한쪽 다리를 뒤로 길게 뻗어 올리는 우아한 자세',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '애티튜드 (Attitude)',
      description: '한쪽 다리를 구부린 채 뒤로 또는 앞으로 들어 올리는 자세',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: "롱드잠 앙 레르 (Rond de jambe en l'air)",
      description: '다리를 공중에 고정시킨 채 종아리로 원을 그리는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '제떼 (Jeté)',
      description: '한 발로 뛰어올라 다른 발을 뻗는 작은 점프',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '아쌈블레 (Assemblé)',
      description: '한 발로 뛰어올라 공중에서 두 발을 모아 착지하는 점프',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '시손느 페르메 (Sissonne Fermée)',
      description: '두 발로 점프해서 한 발로 착지 후 다른 발을 닫는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '파 드 샤 (Pas de chat)',
      description: '고양이 걸음처럼 무릎을 구부린 채 뛰어 넘는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '피루엣 (Pirouette)',
      description: '한 발로 서서 회전하는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '수테뉘 앙 투르낭 (Soutenu en tournant)',
      description: '발을 모으며 회전하는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '아다지오 (Adagio)',
      description: '느리고 유연하며 지속적인 동작의 연결',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '에카르테 (Écarté)',
      description: '다리를 대각선으로 열어 뻗는 방향',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '에파세 (Effacé)',
      description: '다리가 열려 보이는 방향',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '프로메나드 (Promenade)',
      description: '지지하는 발을 돌리며 천천히 몸의 방향을 바꾸는 동작',
      difficulty: 'INTERMEDIATE',
    },
    {
      name: '쉐네 (Chaîné)',
      description: '짧고 빠른 연결 회전 동작',
      difficulty: 'INTERMEDIATE',
    },

    // ADVANCED (고급) 자세
    {
      name: '그랑 제테 (Grand jeté)',
      description: '공중에서 스플릿 자세를 취하며 크게 도약하는 동작',
      difficulty: 'ADVANCED',
    },
    {
      name: '카브리올 (Cabriole)',
      description: "공중에서 한쪽 다리를 다른 쪽 다리로 '치는' 도약 점프",
      difficulty: 'ADVANCED',
    },
    {
      name: '앙트르샤 시스 (Entrechat six)',
      description: '공중에서 다리를 세 번(총 6회) 교차하여 치는 점프',
      difficulty: 'ADVANCED',
    },
    {
      name: '푸에떼 앙 투르낭 (Fouetté en tournant)',
      description: '채찍질하듯이 다리를 움직이며 빠르게 회전하는 동작',
      difficulty: 'ADVANCED',
    },
    {
      name: "투르 앙 레르 (Tour en l'air)",
      description:
        '공중에서 몸 전체를 한 바퀴 이상 회전하는 점프 (주로 남성 동작)',
      difficulty: 'ADVANCED',
    },
    {
      name: '팡셰 (Penché)',
      description:
        '아라베스크 자세에서 다리를 높이 들어 올린 채 상체를 앞으로 깊게 숙이는 동작',
      difficulty: 'ADVANCED',
    },
    {
      name: '시손느 오베르트 (Sissonne Ouverte)',
      description:
        '두 발로 점프해서 한 발로 착지 후 다른 발을 공중에 뻗어 유지하는 동작',
      difficulty: 'ADVANCED',
    },
    {
      name: '제떼 앙 투르낭 (Jeté en tournant)',
      description: '회전하면서 제떼를 하는 동작',
      difficulty: 'ADVANCED',
    },
    {
      name: '아쌈블레 앙 투르낭 (Assemblé en tournant)',
      description: '회전하면서 아쌈블레를 하는 동작',
      difficulty: 'ADVANCED',
    },
    {
      name: '바뜨리 (Batterie)',
      description:
        '작은 점프 중 다리를 서로 부딪치거나 교차시키는 동작 (앙트르샤, 카브리올 등)',
      difficulty: 'ADVANCED',
    },
    {
      name: '파 드 되 (Pas de deux)',
      description:
        '남녀 무용수가 함께 하는 이인무 (균형, 리프트, 파트너링 기술 요구)',
      difficulty: 'ADVANCED',
    },
    {
      name: '코다 (Coda)',
      description:
        '발레 작품의 마지막 부분에 나오는 빠르고 화려한 솔로 또는 듀엣 동작의 총칭',
      difficulty: 'ADVANCED',
    },
    {
      name: "앙 레르 (En l'air)",
      description: '공중에서 (동작이 지면이 아닌 공중에서 이루어짐을 나타냄)',
      difficulty: 'ADVANCED',
    },
    {
      name: '수 페드 바슈 (Sous-pied-de-vache)',
      description: '아라베스크나 애티튜드 자세를 고정하고 하는 고급 피루엣',
      difficulty: 'ADVANCED',
    },
  ];

  // 발레 자세 데이터 삽입
  for (const pose of balletPoses) {
    await prisma.balletPose.upsert({
      where: { name: pose.name },
      update: {
        name: pose.name,
        description: pose.description,
        difficulty: pose.difficulty as PoseDifficulty,
      },
      create: {
        name: pose.name,
        description: pose.description,
        difficulty: pose.difficulty as PoseDifficulty,
      },
    });
  }

  console.log(`${balletPoses.length}개의 발레 자세 데이터가 추가되었습니다.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
