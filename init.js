const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Инициализация системы...');

  // 1. Проверяем, есть ли уже организация
  let org = await prisma.organization.findFirst();
  if (!org) {
    console.log('Создание организации...');
    org = await prisma.organization.create({
      data: {
        name: 'Главное Управление',
        domain: 'hq.local' // Технический домен
      }
    });
  } else {
    console.log('Организация уже существует.');
  }

  // 2. Проверяем, есть ли админ
  const email = 'admin@hq.local';
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    console.log('Создание Супер-Администратора...');
    const passwordHash = await bcrypt.hash('admin123', 10); // ПАРОЛЬ ПО УМОЛЧАНИЮ

    await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        firstName: 'Главный',
        lastName: 'Администратор',
        role: 'ADMIN',
        organizationId: org.id
      }
    });
    console.log('------------------------------------------------');
    console.log('УСПЕШНО! Администратор создан.');
    console.log('Логин:  admin@hq.local');
    console.log('Пароль: admin123');
    console.log('------------------------------------------------');
  } else {
    console.log('Администратор уже существует.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });