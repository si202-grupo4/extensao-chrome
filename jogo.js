const spriteFundo = new Image();
spriteFundo.src = "./fundo.jpg";

const spriteNave = new Image();
spriteNave.src = "./SNES - Strike Gunner STG - Players Ship.png";

const spriteTiro = new Image();
spriteTiro.src = "./tiro_nave.png"

const spriteTiroEspecial = new Image();
spriteTiroEspecial.src = "./SNES - Strike Gunner STG - Weapon Icons.png";

const spriteEnemies = new Image();
spriteEnemies.src = "./SNES - Strike Gunner STG - Enemy Air Force.png";

const spriteExplosao = new Image();
spriteExplosao.src = "./explosao_inimigos.png";

const spriteExplosaoNuclear = new Image();
spriteExplosaoNuclear.src = "./explosao_nuclear.png";

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

let time = 0;
let estadoTecla = {};
let players = [];
let inimigos = {};
let tiros = {};
let numeroInimigo = 0;

const naveVermelha = {
    padrao: {
        sx: 11,
        sy: 88,
        largura: 29,
        altura: 42
    },

    esquerda1: {
        sx: 345,
        sy: 86,
        largura: 21,
        altura: 41
    },

    esquerda2: {
        sx: 311,
        sy: 86,
        largura: 15,
        altura: 41
    },

    direita1: {
        sx: 70,
        sy: 87,
        largura: 21,
        altura: 41
    },

    direita2: {
        sx: 110,
        sy: 87,
        largura: 15,
        altura: 41
    }
};

const explosaoInimigo = {
    sprite1: {
        sx: 13,
        sy: 14,
        largura: 15,
        altura: 15
    },
    sprite2: {
        sx: 46,
        sy: 8,
        largura: 27,
        altura: 23
    },
    sprite3: {
        sx: 83,
        sy: 3,
        largura: 35,
        altura: 33
    },
    sprite4: {
        sx: 121,
        sy: 0,
        largura: 38,
        altura: 38
    },
    sprite5: {
        sx: 160,
        sy: 0,
        largura: 37,
        altura: 37
    },
    sprite6: {
        sx: 2,
        sy: 43,
        largura: 37,
        altura: 35
    },
    sprite7: {
        sx: 44,
        sy: 45,
        largura: 34,
        altura: 32
    }
}

const bombaNuclear = {
    sprite: {
        sx: 95,
        sy: 252,
        largura: 11,
        altura: 27
    }
}

function gerarNumeroAleatorioInclusivo(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colisaoAtingeInimigo(x, y, largura, altura, chave) {
    colisao = (
        (y <= (inimigos[chave].y + inimigos[chave].altura)
        && y >= inimigos[chave].y
        && inimigos[chave].x <= x
        && x <= (inimigos[chave].x + inimigos[chave].largura)
        && inimigos[chave].x <= (x + largura) 
        && (x + largura) <= (inimigos[chave].x + inimigos[chave].largura))
        || ((x + largura) >= inimigos[chave].x
        && (x + largura) <= (inimigos[chave].x + inimigos[chave].largura)
        && y >= inimigos[chave].y
        && y <= (inimigos[chave].y + inimigos[chave].altura)
        && (y + altura) >= inimigos[chave].y
        && (y + altura) <= (inimigos[chave].y + inimigos[chave].altura))
        || (x <= (inimigos[chave].x + inimigos[chave].largura)
        && x >= inimigos[chave].x
        && y >= inimigos[chave].y
        && y <= (inimigos[chave].y + inimigos[chave].altura)
        && (y + altura) >= inimigos[chave].y
        && (y + altura) <= (inimigos[chave].y + inimigos[chave].altura))
        || (y + altura) >= inimigos[chave].y
        && (y + altura) <= (inimigos[chave].y + inimigos[chave].altura)
        && x >= inimigos[chave].x
        && x <= (inimigos[chave].x + inimigos[chave].largura)
        && (x + largura) >= inimigos[chave].x
        && (x + largura) <= (inimigos[chave].x + inimigos[chave].largura)
    )

    return colisao;
}

class Nave {
    vida = 1;
    sprite = spriteNave;
    x = 200 - 29 / 2;
    y = 410;
    aceleracao = 0.5;
    velocidadeX = 0;
    velocidadeY = 0;
    velocidadeMax = 6;
    intervaloTiro = 100; //Em ms
    intervaloTiroEspecial = 1000; //Em ms
    numeroTiros = 0;
    quantidadeTiroEspecial = 3;

    constructor(sx, sy, largura, altura) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.tempoUltimoTiro = 0;
        this.tempoUltimoTiroEspecial = 0;
        this.destruido = new Explosao();
    }
    
    animacao({sx, sy, largura, altura}) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
    }

    desenha() {
        contexto.drawImage(
            this.sprite,
            this.sx, this.sy,
            this.largura, this.altura,
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    movimento(fundo_largura, fundo_altura) {
        this.atingeInimigo();

        if(this.vida <= 0) {
            return "Game Over";
        }

        this.animacao(naveVermelha.padrao);

        if((estadoTecla["d"] || estadoTecla["D"]) 
            && (estadoTecla["a"] || estadoTecla["A"])) {
                this.velocidadeX = 0;
        }

        if(estadoTecla["d"] || estadoTecla["D"]) {
            if((this.x + this.largura) < fundo_largura) {
                this.velocidadeX += this.aceleracao;
                this.animacao(naveVermelha.direita1);

                if(this.velocidadeX > 5) {
                    this.animacao(naveVermelha.direita2);
                }
            } else {
                this.velocidadeX = 0;
                this.animacao(naveVermelha.direita1);
            }
        }

        if(estadoTecla["a"] || estadoTecla["A"]) {
            if(this.x > 0) {
                this.velocidadeX -= this.aceleracao;
                this.animacao(naveVermelha.esquerda1);
                if(this.velocidadeX < -5) {
                    this.animacao(naveVermelha.esquerda2);
                }
            } else {
                this.velocidadeX = 0;
                this.animacao(naveVermelha.direita1);
            }
        } 

        if(estadoTecla["w"] || estadoTecla["W"]) {
            if(this.y > 0) {
                this.velocidadeY -= this.aceleracao;
            } else {
                this.velocidadeY = 0;
            }
        }

        if(estadoTecla["s"] || estadoTecla["S"]) {
            if((this.y + this.altura) < fundo_altura) {
                this.velocidadeY += this.aceleracao;
            } else {
                this.velocidadeY = 0;
            }
        } 
         
        if(!((estadoTecla["d"] || estadoTecla["D"]) || (estadoTecla["a"] || estadoTecla["A"]))) {
            this.velocidadeX = 0;
        } 
        if(!((estadoTecla["w"] || estadoTecla["W"]) || (estadoTecla["s"] || estadoTecla["S"]))){
            this.velocidadeY = 0;
        }
        
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;

        if(this.velocidadeX > this.velocidadeMax) {
            this.velocidadeX = this.velocidadeMax;
        }
        if(this.velocidadeX < -this.velocidadeMax) {
            this.velocidadeX = -this.velocidadeMax;
        }
        if(this.velocidadeY > this.velocidadeMax) {
            this.velocidadeY = this.velocidadeMax;
        }
        if(this.velocidadeY < -this.velocidadeMax) {
            this.velocidadeY = -this.velocidadeMax;
        }
    }

    atingeInimigo() {
        for (const chave in inimigos) {
            if(inimigos[chave].vida > 0 && this.vida > 0) {
                if(colisaoAtingeInimigo(this.x, this.y, this.largura, this.altura, chave)){  
                    this.vida -= 1;
                }
            }
        }
        if(this.vida <= 0) {
            this.explode();
        }
    }

    atirar() {
        if (estadoTecla[" "] && Date.now() - this.tempoUltimoTiro > this.intervaloTiro) {
            tiros[this.numeroTiros] = new TiroNave(68, 237, 12, 12, (this.x + this.largura / 2) - 7, this.y, this.numeroTiros);
            this.tempoUltimoTiro = Date.now();
            this.numeroTiros += 1;
        }

        for (const chave in tiros) {
            tiros[chave].movimento();
        }
    }

    atirarTiroEspecial() {
        if(this.quantidadeTiroEspecial > 0) {
            if((estadoTecla["e"] || estadoTecla["E"]) && Date.now() - this.tempoUltimoTiroEspecial > this.intervaloTiroEspecial) {
                const sx = bombaNuclear.sprite.sx;
                const sy = bombaNuclear.sprite.sy;
                const largura = bombaNuclear.sprite.largura;
                const altura = bombaNuclear.sprite.altura;
                this.tiroEspecial = new PoderEspecialNave(sx, sy, largura, altura, (this.x + this.largura / 2) - 7, this.y);
                this.tempoUltimoTiroEspecial = Date.now();
                this.quantidadeTiroEspecial -= 1;
            }
        }
        if(this.tiroEspecial instanceof PoderEspecialNave) {
            this.tiroEspecial.movimento();
        }
    }

    explode() {
        this.destruido.explodiu(this);
    }
}

class TiroNave {
    velocidadeTiro = 7;
    atingiuInimigo = false;

    constructor(sx, sy, largura, altura, x, y, numeroTiro) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.x = x;
        this.y = y;
        this.numeroTiro = numeroTiro;
    }

    desenha() {
        contexto.drawImage(
            spriteTiro,
            this.sx, this.sy,
            this.largura, this.altura,
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    movimento() {
        this.y -= this.velocidadeTiro;
        
        if(this.y < -5) {
            delete tiros[this.numeroTiro];
        }

        this.atingeInimigo();
    }

    atingeInimigo() {
        for (const chave in inimigos) {
            if(inimigos[chave].vida > 0) {
                if(colisaoAtingeInimigo(this.x, this.y, this.largura, this.altura, chave)) {
                    inimigos[chave].vida -= 1;
                    delete tiros[this.numeroTiro];
                }
            }
        }
    }
}

class PoderEspecialNave {
    sprite = spriteTiroEspecial
    velocidadeMaxTiro = 4.5;
    velocidadeTiro = 1;
    aceleracaoTiro = 0.05;
    desaceleracaoTiro = 0.5;
    atingiuVelocidadeMax = false;
    atingiuInimigo = false;

    constructor(sx, sy, largura, altura, x, y) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.x = x;
        this.y = y;
        this.explosaoNuclear = new Explosao();
    }

    desenha() {
        contexto.drawImage(
            this.sprite,
            this.sx, this.sy,
            this.largura, this.altura,
            this.x, this.y,
            this.largura, this.altura,
        );
    }
    
    movimento() {
        this.atingeInimigo();

        if(this.velocidadeTiro <= 0) {
            // console.log("ola")
            this.explosaoNuclear.explodiu(this);
        } else {
            if(this.atingiuVelocidadeMax) {
                if(this.velocidadeTiro > 0) {
                    this.velocidadeTiro -= this.desaceleracaoTiro;
                } else {
                    this.velocidadeTiro = 0;
                }
            } else {
                this.velocidadeTiro += this.aceleracaoTiro;
                if(this.velocidadeTiro >= this.velocidadeMaxTiro) {
                    this.atingiuVelocidadeMax = true;
                }
            }
            this.y -= this.velocidadeTiro;
        }
    }

    atingeInimigo() {
        for (const chave in inimigos) {
            if (inimigos[chave].vida > 0) {
                if(this.x < inimigos[chave].x + inimigos[chave].largura && 
                    this.x + this.largura > inimigos[chave].x &&
                    this.y < inimigos[chave].y + inimigos[chave].altura &&
                    this.y + this.altura > inimigos[chave].y
                ) {
                    inimigos[chave].vida = 0;
                    this.velocidadeTiro = 0;
                }
            }
        }
    }
    
}

class HelicopteroCinzaInimigo {
    vida = 1;
    sprite = spriteEnemies;
    taxaAtualização = 2;
    frameMovimentoAtual = 0;
    spriteMovimentos = [
        {sx: 149, sy: 10, largura: 53,altura: 53},
        {sx: 149, sy: 80, largura: 53,altura: 53}
    ];
    angle = 0;  // Ângulo inicial


    constructor(x, y, numeroInimigo) {
        this.x = x;
        this.y = y;
        this.centerX = x;
        this.centerY = y;
        this.radius = gerarNumeroAleatorioInclusivo(100, 200);
        this.numeroInimigo = numeroInimigo;
        this.destruido = new Explosao();
    }
    
    animacao() {
        const passouIntervalo = time % this.taxaAtualização;
        if(passouIntervalo) {
            const dividendo = this.frameMovimentoAtual + 1;
            const divisor = this.spriteMovimentos.length;
            this.frameMovimentoAtual = dividendo % divisor;

            this.sx = this.spriteMovimentos[this.frameMovimentoAtual].sx;
            this.sy = this.spriteMovimentos[this.frameMovimentoAtual].sy;
            this.largura = this.spriteMovimentos[this.frameMovimentoAtual].largura;
            this.altura = this.spriteMovimentos[this.frameMovimentoAtual].altura;
        }
    }

    desenha() {
        contexto.drawImage(
            this.sprite,
            this.sx, this.sy,
            this.largura, this.altura,
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    movimento() {
        if(this.vida <= 0) {
            this.explode();
        } else {
            this.animacao();

            if(this.centerX > 0) {
                this.x = this.centerX + this.radius * Math.cos(this.angle);
                this.y = this.centerY + this.radius * Math.sin(this.angle);
                this.angle -= 0.01;
            } else {
                this.x = this.centerX - this.radius * Math.cos(this.angle);
                this.y = this.centerY - this.radius * Math.sin(this.angle);
                this.angle += 0.01;
            }
        }
    }

    explode() {
        this.destruido.explodiu(this);
    }
}

class Explosao {
    spriteExplosaoNuclear = [
        // { sx: 55, sy: 53, largura: 18, altura: 18 },
        { sx: 181, sy: 51, largura: 22, altura: 22 },
        // { sx: 303, sy: 46, largura: 33, altura: 33 },
        { sx: 422, sy: 36, largura: 49, altura: 50 },
        // { sx: 547, sy: 34, largura: 58, altura: 55 },
        { sx: 28, sy: 155, largura: 73, altura: 69 },
        // { sx: 150, sy: 149, largura: 82, altura: 81 },
        { sx: 277, sy: 146, largura: 86, altura: 89 },
        // { sx: 407, sy: 148, largura: 82, altura: 83 },
        { sx: 533, sy: 148, largura: 85, altura: 85 },
        // { sx: 16, sy: 269, largura: 97, altura: 96 },
        { sx: 142, sy: 267, largura: 99, altura: 100 },
        // { sx: 266, sy: 264, largura: 107, altura: 107 },
        { sx: 266, sy: 264, largura: 107, altura: 107 },
        // { sx: 266, sy: 264, largura: 107, altura: 107 },
        { sx: 266, sy: 264, largura: 107, altura: 107 },
        // { sx: 266, sy: 264, largura: 107, altura: 107 },
        { sx: 386, sy: 256, largura: 121, altura: 120 },
        // { sx: 512, sy: 256, largura: 127, altura: 125 },
        { sx: 0, sy: 384, largura: 127, altura: 126 },
        // { sx: 127, sy: 384, largura: 129, altura: 127 },
        { sx: 254, sy: 384, largura: 130, altura: 128 },
        // { sx: 0, sy: 0, largura: 0, altura: 0 }
    ];
    spriteExplosoes = [
        { sx: 13, sy: 14, largura: 15, altura: 15 },
        { sx: 46, sy: 8, largura: 27, altura: 23 },
        { sx: 83, sy: 3, largura: 35, altura: 33 },
        { sx: 121, sy: 0, largura: 38, altura: 38 },
        { sx: 160, sy: 0, largura: 37, altura: 37 },
        { sx: 2, sy: 43, largura: 37, altura: 35 },
        { sx: 44, sy: 45, largura: 34, altura: 32 }
    ];
    tempoExplosao = 50;
    ultimaExplosao = 0;
    escolherExplosao = 0;
    xReferencia = [];

    explodiu(instancia) {
        instancia.sprite = spriteExplosao;
        let spriteExplosaoInfo = this.spriteExplosoes;
        if(instancia instanceof PoderEspecialNave) {
            instancia.sprite = spriteExplosaoNuclear;
            spriteExplosaoInfo = this.spriteExplosaoNuclear;
        }

        if(Date.now() - this.ultimaExplosao > this.tempoExplosao) {                    
            if(this.escolherExplosao < spriteExplosaoInfo.length) {
                instancia.sx = spriteExplosaoInfo[this.escolherExplosao].sx;
                instancia.sy = spriteExplosaoInfo[this.escolherExplosao].sy;
                instancia.largura = spriteExplosaoInfo[this.escolherExplosao].largura;
                instancia.altura = spriteExplosaoInfo[this.escolherExplosao].altura;
                if(instancia instanceof PoderEspecialNave) {
                    this.tempoExplosao = 10;
                    this.xReferencia.push(instancia.x);
                    instancia.x = this.xReferencia[0] - spriteExplosaoInfo[this.escolherExplosao].largura / 2;
                }
                this.escolherExplosao += 1;
                this.ultimaExplosao = Date.now();
            } else {
                if(instancia instanceof Nave) {
                    players.shift();
                } else if(instancia instanceof PoderEspecialNave) {
                    delete players[0].tiroEspecial;
                } else if(instancia instanceof HelicopteroCinzaInimigo) {
                    delete inimigos[instancia.numeroInimigo];
                }
            }
        }
    }
}
            
class PlanoFundo {
    x = 0;
    y = 0;
    largura = canvas.width;
    altura = canvas.height;
    velocidadeMovimento = 2;
    
    desenha() {
        contexto.drawImage(
            spriteFundo,
            this.x, (this.y - this.altura),
            this.largura, this.altura,
        );

        contexto.drawImage(
            spriteFundo,
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    atualiza() {
        let movimentacao = this.y + this.velocidadeMovimento;
        this.y = movimentacao % this.altura;
    }
}

class Telas {
    constructor(tela) {
        this.tela = tela;
        if(tela == "JOGO") {
            this.fundo = new PlanoFundo();
            players.push(new Nave(naveVermelha.padrao));
        }
    }
    
    desenha() {
        if(this.tela == "JOGO") {
            this.fundo.desenha();
            this.fundo.atualiza();
            
            for(let i = 0; i < players.length; i++) {
                players[i].desenha();
                if(players[i].tiroEspecial instanceof PoderEspecialNave) {
                    players[i].tiroEspecial.desenha();
                }
            }            
            
            for(const chave in tiros) {
                tiros[chave].desenha();
            }

            for(const chave in inimigos) {
                inimigos[chave].desenha();
            }
        }
    }
    
    atualiza() {
        if(this.tela == "JOGO") {
            if(players.length > 0) {
                for(let i = 0; i < players.length; i++) {
                    players[i].movimento(this.fundo.largura, this.fundo.altura);
                    players[i].atirar();
                    players[i].atirarTiroEspecial();
                }
            } else {
                console.log("GAME OVER");
            }

            for (const chave in inimigos) {
                inimigos[chave].movimento();
            }
        }
    }
}

telaAtiva = new Telas("JOGO");

window.addEventListener('keydown', (event) => {
    estadoTecla[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    estadoTecla[event.key] = false;
});

function geradorInimigos() {
    const tempoInimigo = 10;

    if(time % tempoInimigo == 0) {
        const xAleatorio = [-10, canvas.width];
        const escolherXAleatorio = gerarNumeroAleatorioInclusivo(0, 1);
        const yAleatorio = gerarNumeroAleatorioInclusivo(-10, canvas.height / 2);
        console.log(xAleatorio[escolherXAleatorio], yAleatorio);
        const inimigo = new HelicopteroCinzaInimigo(xAleatorio[escolherXAleatorio], yAleatorio, numeroInimigo);
        inimigos[numeroInimigo] = inimigo;
        numeroInimigo += 1;
    }
}

function runGame() {
    geradorInimigos();
    
    telaAtiva.desenha();
    telaAtiva.atualiza();
    
    time += 1;

    requestAnimationFrame(runGame);
}

runGame();
