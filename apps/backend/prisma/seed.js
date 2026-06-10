// Seed — popula a base de dados com as perguntas iniciais
// Executar: yarn workspace backend db:seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  // Angola 🇦🇴
  {
    question: 'Qual é a capital de Angola?',
    options: ['Benguela', 'Huambo', 'Luanda', 'Lobito'],
    correctAnswer: 2,
    explanation: 'Luanda é a capital e a maior cidade de Angola, localizada na costa do Oceano Atlântico.',
    hint: 'Fica situada à beira-mar e é famosa pela sua baía de águas calmas.',
    category: 'Angola 🇦🇴',
  },
  {
    question: 'Em que ano Angola conquistou a sua independência de Portugal?',
    options: ['1961', '1970', '1975', '1980'],
    correctAnswer: 2,
    explanation: 'Angola tornou-se independente a 11 de novembro de 1975.',
    hint: 'Aconteceu em meados da década de 70.',
    category: 'Angola 🇦🇴',
  },
  {
    question: 'Quem foi o primeiro presidente de Angola?',
    options: ['Jonas Savimbi', 'José Eduardo dos Santos', 'Agostinho Neto', 'Holden Roberto'],
    correctAnswer: 2,
    explanation: 'António Agostinho Neto foi o primeiro presidente de Angola (1975-1979).',
    hint: "Foi um prestigiado médico e poeta, autor de 'Sagrada Esperança'.",
    category: 'Angola 🇦🇴',
  },
  {
    question: 'Qual é a moeda oficial de Angola?',
    options: ['Escudo', 'Real', 'Kwanza', 'Dólar Angolano'],
    correctAnswer: 2,
    explanation: 'O Kwanza (AOA) é a moeda oficial de Angola desde 1977.',
    hint: 'Tem o mesmo nome de um dos rios mais importantes de Angola.',
    category: 'Angola 🇦🇴',
  },
  {
    question: 'Quantas províncias tem Angola?',
    options: ['12', '15', '18', '20'],
    correctAnswer: 2,
    explanation: 'Angola é dividida em 18 províncias.',
    hint: 'É um número par, maior do que 16 e menor do que 20.',
    category: 'Angola 🇦🇴',
  },
  {
    question: 'Qual é o rio mais extenso de Angola?',
    options: ['Rio Kwanza', 'Rio Zambeze', 'Rio Cunene', 'Rio Congo'],
    correctAnswer: 0,
    explanation: 'O Rio Kwanza tem cerca de 960 km e é o maior rio inteiramente angolano.',
    hint: 'Este rio dá nome à moeda oficial utilizada no país.',
    category: 'Angola 🇦🇴',
  },
  {
    question: 'Qual deserto se encontra no sul de Angola?',
    options: ['Saara', 'Kalahari', 'Namibe', 'Gobi'],
    correctAnswer: 2,
    explanation: 'O Deserto do Namibe estende-se pelo sudoeste de Angola até à Namíbia.',
    hint: 'Este deserto partilha o seu nome com uma província litoral no sudoeste angolano.',
    category: 'Angola 🇦🇴',
  },
  {
    question: "Qual escritor angolano escreveu 'Luuanda'?",
    options: ['Pepetela', 'José Luandino Vieira', 'Ondjaki', 'Agostinho Neto'],
    correctAnswer: 1,
    explanation: "José Luandino Vieira publicou 'Luuanda' em 1964, uma obra de contos sobre os musseques de Luanda.",
    hint: 'O autor tem o próprio nome da capital de Angola incorporado no seu apelido literário.',
    category: 'Angola 🇦🇴',
  },

  // África 🌍
  {
    question: 'Qual é o maior país de África em extensão territorial?',
    options: ['República Democrática do Congo', 'Sudão', 'Argélia', 'Nigéria'],
    correctAnswer: 2,
    explanation: 'A Argélia é o maior país de África com 2,38 milhões de km².',
    hint: 'Fica situado no norte de África com vasta cobertura do Saara.',
    category: 'África 🌍',
  },
  {
    question: 'Qual é a montanha mais alta de África?',
    options: ['Monte Quénia', 'Kilimanjaro', 'Monte Atlas', 'Monte Elgon'],
    correctAnswer: 1,
    explanation: 'O Monte Kilimanjaro, na Tanzânia, tem 5.895 metros de altitude.',
    hint: 'Está localizada na Tanzânia e é famosa pelas suas neves eternas no topo.',
    category: 'África 🌍',
  },
  {
    question: 'Quantos países existem no continente africano?',
    options: ['44', '48', '54', '60'],
    correctAnswer: 2,
    explanation: 'O continente africano tem 54 países reconhecidos.',
    hint: 'É um número par, um pouco maior do que 50.',
    category: 'África 🌍',
  },
  {
    question: 'Qual é o maior lago de África?',
    options: ['Lago Tanganica', 'Lago Vitória', 'Lago Malawi', 'Lago Chade'],
    correctAnswer: 1,
    explanation: 'O Lago Vitória é o maior lago de África com 69.485 km².',
    hint: 'O nome deste lago é uma homenagem a uma célebre rainha britânica do século XIX.',
    category: 'África 🌍',
  },
  {
    question: 'Qual país africano nunca foi colonizado por potências europeias?',
    options: ['Gana', 'Nigéria', 'Etiópia', 'Quénia'],
    correctAnswer: 2,
    explanation: 'A Etiópia nunca foi colonizada e resistiu à invasão italiana.',
    hint: "Fica no 'Corno de África' e a sua capital é Adis Abeba.",
    category: 'África 🌍',
  },
  {
    question: 'Qual é o deserto mais extenso de África?',
    options: ['Kalahari', 'Namibe', 'Saara', 'Líbio'],
    correctAnswer: 2,
    explanation: 'O Deserto do Saara cobre cerca de 9,2 milhões de km² no norte de África.',
    hint: "O seu nome significa literalmente 'deserto' em árabe.",
    category: 'África 🌍',
  },
  {
    question: 'Qual país africano é o mais populoso do continente?',
    options: ['Etiópia', 'Egito', 'Nigéria', 'África do Sul'],
    correctAnswer: 2,
    explanation: 'A Nigéria tem mais de 220 milhões de habitantes.',
    hint: "A sua capital é Abuja e é famoso pelo cinema 'Nollywood'.",
    category: 'África 🌍',
  },

  // Cultura Geral
  {
    question: 'Quem pintou a Mona Lisa?',
    options: ['Michelangelo', 'Rafael', 'Leonardo da Vinci', 'Botticelli'],
    correctAnswer: 2,
    explanation: 'Leonardo da Vinci pintou a Mona Lisa entre 1503 e 1519.',
    hint: 'Foi um génio renascentista que também projetou helicópteros e pontes.',
    category: 'geral',
  },
  {
    question: 'Qual é o maior planeta do Sistema Solar?',
    options: ['Saturno', 'Júpiter', 'Neptuno', 'Urano'],
    correctAnswer: 1,
    explanation: 'Júpiter é o maior planeta do Sistema Solar, com 139.820 km de diâmetro.',
    hint: "Possui a famosa 'Grande Mancha Vermelha'.",
    category: 'geral',
  },
  {
    question: 'Em que ano o Homem pisou na Lua pela primeira vez?',
    options: ['1965', '1969', '1971', '1973'],
    correctAnswer: 1,
    explanation: 'Neil Armstrong pisou na Lua a 20 de julho de 1969, missão Apollo 11.',
    hint: 'Ocorreu na parte final da década de 1960.',
    category: 'geral',
  },
  {
    question: 'Qual linguagem de programação é mais usada para desenvolvimento web?',
    options: ['Python', 'Java', 'JavaScript', 'C++'],
    correctAnswer: 2,
    explanation: 'JavaScript é a linguagem mais utilizada no desenvolvimento web.',
    hint: 'É a base do React e funciona tanto no frontend como no backend.',
    category: 'geral',
  },
  {
    question: "Quem escreveu 'Os Lusíadas'?",
    options: ['Fernando Pessoa', 'Luís de Camões', 'Eça de Queirós', 'José Saramago'],
    correctAnswer: 1,
    explanation: "Luís de Camões escreveu 'Os Lusíadas', publicado em 1572.",
    hint: 'É famoso por ter apenas um olho funcional.',
    category: 'geral',
  },
];

async function main() {
  console.log('🌱  A popular a base de dados…');

  // Extrair categorias únicas
  const categoryNames = [...new Set(questions.map((q) => q.category))];

  // Criar categorias (upsert para ser idempotente)
  const categoryMap = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap[name] = cat.id;
    console.log(`  ✔ Categoria: ${name} (id=${cat.id})`);
  }

  // Criar perguntas
  let created = 0;
  for (const q of questions) {
    await prisma.question.create({
      data: {
        question:      q.question,
        options:       q.options,
        correctAnswer: q.correctAnswer,
        explanation:   q.explanation ?? null,
        hint:          q.hint ?? null,
        categoryId:    categoryMap[q.category],
      },
    });
    created++;
  }

  console.log(`\n✅  Seed concluído: ${created} perguntas em ${categoryNames.length} categorias.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
