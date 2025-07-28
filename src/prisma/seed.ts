import prisma from './prisma.middleware';

async function main() {
  await prisma.$transaction(async (tx) => {
    const roles = [
      { name: 'superAdmin' },
      { name: 'user' },
      { name: 'moderator' },
    ] as const;

    for (const role of roles) {
      await tx.role.create({
        data: role,
      });
    }

    const tags = [
      { name: 'Web3' },
      { name: 'AI/ML' },
      { name: 'FinTech' },
      { name: 'EdTech' },
      { name: 'IoT' },
      { name: 'E-commerce' },
    ];

    for (const tag of tags) {
      await tx.tag.create({
        data: tag,
      });
    }
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
