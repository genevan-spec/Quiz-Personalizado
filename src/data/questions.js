// Banco de perguntas
// Para adicionar mais, basta copiar o formato e preencher.

const questions = [
  // Angola 🇦🇴
  {
    id: 1,
    question: "Qual é a capital de Angola?",
    options: ["Benguela", "Huambo", "Luanda", "Lobito"],
    correctAnswer: 2,
    explanation: "Luanda é a capital e a maior cidade de Angola, localizada na costa do Oceano Atlântico. É o centro político, económico e cultural do país.",
    hint: "Fica situada à beira-mar e é famosa pela sua baía de águas calmas.",
    category: "Angola 🇦🇴"
  },
  {
    id: 2,
    question: "Em que ano Angola conquistou a sua independência de Portugal?",
    options: ["1961", "1970", "1975", "1980"],
    correctAnswer: 2,
    explanation: "Angola tornou-se independente a 11 de novembro de 1975, após uma longa luta de libertação. O primeiro presidente foi António Agostinho Neto.",
    hint: "Aconteceu em meados da década de 70, no mesmo ano em que Moçambique e Cabo Verde também se tornaram independentes.",
    category: "Angola 🇦🇴"
  },
  {
    id: 3,
    question: "Quem foi o primeiro presidente de Angola?",
    options: ["Jonas Savimbi", "José Eduardo dos Santos", "Agostinho Neto", "Holden Roberto"],
    correctAnswer: 2,
    explanation: "António Agostinho Neto foi o primeiro presidente de Angola (1975-1979). Foi também poeta e médico, sendo considerado o pai da nação angolana.",
    hint: "Foi um prestigiado médico e poeta, autor da célebre obra literária 'Sagrada Esperança'.",
    category: "Angola 🇦🇴"
  },
  {
    id: 4,
    question: "Qual é a moeda oficial de Angola?",
    options: ["Escudo", "Real", "Kwanza", "Dólar Angolano"],
    correctAnswer: 2,
    explanation: "O Kwanza (AOA) é a moeda oficial de Angola desde 1977. O nome vem do rio Kwanza, o maior rio que corre inteiramente em território angolano.",
    hint: "Tem o mesmo nome de um dos rios mais importantes e navegáveis de Angola.",
    category: "Angola 🇦🇴"
  },
  {
    id: 5,
    question: "Quantas províncias tem Angola?",
    options: ["12", "15", "18", "20"],
    correctAnswer: 2,
    explanation: "Angola é dividida em 18 províncias. Luanda é a mais pequena em área, mas a mais populosa. Moxico é a maior província em extensão territorial.",
    hint: "É um número par, maior do que 16 e menor do que 20.",
    category: "Angola 🇦🇴"
  },
  {
    id: 6,
    question: "Qual é o rio mais extenso de Angola?",
    options: ["Rio Kwanza", "Rio Zambeze", "Rio Cunene", "Rio Congo"],
    correctAnswer: 0,
    explanation: "O Rio Kwanza tem cerca de 960 km e é o maior rio inteiramente angolano. Nasce na província do Bié e desagua no Oceano Atlântico, perto de Luanda.",
    hint: "Este rio dá nome à moeda oficial utilizada no país.",
    category: "Angola 🇦🇴"
  },
  {
    id: 7,
    question: "Qual deserto se encontra no sul de Angola?",
    options: ["Saara", "Kalahari", "Namibe", "Gobi"],
    correctAnswer: 2,
    explanation: "O Deserto do Namibe estende-se pelo sudoeste de Angola até à Namíbia. É o lar da icónica planta Welwitschia mirabilis, que pode viver mais de 1.000 anos.",
    hint: "Este deserto partilha o seu nome com uma província litoral no sudoeste angolano.",
    category: "Angola 🇦🇴"
  },
  {
    id: 8,
    question: "Qual escritor angolano escreveu 'Luuanda'?",
    options: ["Pepetela", "José Luandino Vieira", "Ondjaki", "Agostinho Neto"],
    correctAnswer: 1,
    explanation: "José Luandino Vieira publicou 'Luuanda' em 1964, uma obra de contos que retrata a vida nos musseques de Luanda. O livro é um marco da literatura angolana.",
    hint: "O autor tem o próprio nome da capital de Angola incorporado no seu apelido literário.",
    category: "Angola 🇦🇴"
  },

  // África 🌍
  {
    id: 9,
    question: "Qual é o maior país de África em extensão territorial?",
    options: ["República Democrática do Congo", "Sudão", "Argélia", "Nigéria"],
    correctAnswer: 2,
    explanation: "A Argélia é o maior país de África com 2,38 milhões de km². Após a separação do Sudão do Sul em 2011, ultrapassou o Sudão.",
    hint: "Fica situado no norte de África e tem uma vasta percentagem do seu território coberta pelo deserto do Saara.",
    category: "África 🌍"
  },
  {
    id: 10,
    question: "Qual é a montanha mais alta de África?",
    options: ["Monte Quénia", "Kilimanjaro", "Monte Atlas", "Monte Elgon"],
    correctAnswer: 1,
    explanation: "O Monte Kilimanjaro, na Tanzânia, tem 5.895 metros de altitude. É a montanha mais alta de África e o pico mais alto do mundo que não faz parte de uma cordilheira.",
    hint: "Está localizada na Tanzânia e é mundialmente famosa pelas suas neves eternas no topo.",
    category: "África 🌍"
  },
  {
    id: 11,
    question: "Quantos países existem no continente africano?",
    options: ["44", "48", "54", "60"],
    correctAnswer: 2,
    explanation: "O continente africano tem 54 países reconhecidos, sendo o segundo continente com mais países do mundo, depois da Ásia.",
    hint: "É um número par, um pouco maior do que 50 e menor do que 58.",
    category: "África 🌍"
  },
  {
    id: 12,
    question: "Qual é o maior lago de África?",
    options: ["Lago Tanganica", "Lago Vitória", "Lago Malawi", "Lago Chade"],
    correctAnswer: 1,
    explanation: "O Lago Vitória é o maior lago de África com 69.485 km², partilhado entre Uganda, Tanzânia e Quénia. É também o segundo maior lago de água doce do mundo.",
    hint: "O nome deste lago é uma homenagem a uma célebre rainha britânica do século XIX.",
    category: "África 🌍"
  },
  {
    id: 13,
    question: "Qual país africano nunca foi colonizado por potências europeias?",
    options: ["Gana", "Nigéria", "Etiópia", "Quénia"],
    correctAnswer: 2,
    explanation: "A Etiópia é um dos únicos países africanos que nunca foi colonizado. Resistiu à invasão italiana e manteve a sua independência ao longo da história.",
    hint: "Fica situado no 'Corno de África' e a sua capital é a cidade de Adis Abeba.",
    category: "África 🌍"
  },
  {
    id: 14,
    question: "Qual é o deserto mais extenso de África?",
    options: ["Kalahari", "Namibe", "Saara", "Líbio"],
    correctAnswer: 2,
    explanation: "O Deserto do Saara é o maior deserto quente do mundo, com cerca de 9,2 milhões de km², cobrindo grande parte do norte de África.",
    hint: "É mundialmente famoso e o seu nome significa literalmente 'deserto' em árabe.",
    category: "África 🌍"
  },
  {
    id: 15,
    question: "Qual país africano é o mais populoso do continente?",
    options: ["Etiópia", "Egito", "Nigéria", "África do Sul"],
    correctAnswer: 2,
    explanation: "A Nigéria é o país mais populoso de África com mais de 220 milhões de habitantes, sendo também a maior economia do continente.",
    hint: "A sua capital é Abuja e é muito famoso mundialmente pela sua grande indústria de cinema conhecida como 'Nollywood'.",
    category: "África 🌍"
  },

  // Cultura Geral 🌐
  {
    id: 16,
    question: "Quem pintou a Mona Lisa?",
    options: ["Michelangelo", "Rafael", "Leonardo da Vinci", "Botticelli"],
    correctAnswer: 2,
    explanation: "Leonardo da Vinci pintou a Mona Lisa entre 1503 e 1519. A obra está no Museu do Louvre, Paris.",
    hint: "Foi um génio italiano renascentista que também desenhou projetos de helicópteros e pontes.",
    category: "Arte"
  },
  {
    id: 17,
    question: "Qual é o maior planeta do Sistema Solar?",
    options: ["Saturno", "Júpiter", "Neptuno", "Urano"],
    correctAnswer: 1,
    explanation: "Júpiter é o maior planeta do Sistema Solar, com um diâmetro de aproximadamente 139.820 km.",
    hint: "Fica posicionado depois de Marte e possui uma famosa 'Grande Mancha Vermelha' na sua atmosfera.",
    category: "Ciência"
  },
  {
    id: 18,
    question: "Em que ano o Homem pisou na Lua pela primeira vez?",
    options: ["1965", "1969", "1971", "1973"],
    correctAnswer: 1,
    explanation: "Neil Armstrong pisou na Lua em 20 de julho de 1969, durante a missão Apollo 11.",
    hint: "Ocorreu na parte final da vibrante década de 1960.",
    category: "História"
  },
  {
    id: 19,
    question: "Qual linguagem de programação é mais usada para desenvolvimento web?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: 2,
    explanation: "JavaScript é a linguagem mais utilizada no desenvolvimento web, funcionando tanto no frontend como no backend.",
    hint: "Partilha as primeiras 4 letras do nome com a linguagem Java, mas são tecnologias completamente diferentes. É a base do React.",
    category: "Tecnologia"
  },
  {
    id: 20,
    question: "Quem escreveu 'Os Lusíadas'?",
    options: ["Fernando Pessoa", "Luís de Camões", "Eça de Queirós", "José Saramago"],
    correctAnswer: 1,
    explanation: "Luís de Camões escreveu 'Os Lusíadas', publicado em 1572, a obra épica da literatura portuguesa.",
    category: "Literatura",
    hint: "É um dos poetas mais marcantes da língua portuguesa, famoso por ter apenas um olho funcional."
  }
];

export default questions;
