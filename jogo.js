const spriteFundo = new Image();
spriteFundo.src = "./fundo.jpg";

const spriteNave = new Image();
spriteNave.src = "./SNES - Strike Gunner STG - Players Ship.png";

const spriteTiro = new Image();
spriteTiro.src = "./tiro_nave.png"

const spriteEnemies = new Image();
spriteEnemies.src = "./SNES - Strike Gunner STG - Enemy Air Force.png";

const spriteExplosaoInimigo = new Image();
spriteExplosaoInimigo.src = "./explosao_inimigos.png";

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
    spriteAtual = spriteNave;
    x = 200 - 29 / 2;
    y = 410;
    aceleracao = 0.5;
    velocidadeX = 0;
    velocidadeY = 0;
    velocidadeMax = 6;
    intervaloTiro = 500; //Em ms;
    numeroTiros = 0;

    constructor(sx, sy, largura, altura) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.tempoUltimoTiro = 0;
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
            this.spriteAtual,
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

    explode() {
        this.spriteAtual = spriteExplosaoInimigo;
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

class HelicopteroCinzaEnemie {
    vida = 1;
    spriteAtual = spriteEnemies;
    taxaAtualização = 2;
    frameMovimentoAtual = 0;
    spriteMovimentos = [
        {sx: 149, sy: 10, largura: 53,altura: 53},
        {sx: 149, sy: 80, largura: 53,altura: 53}
    ];

    constructor(x, y, numeroInimigo) {
        this.x = x;
        this.y = y;
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
            this.spriteAtual,
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
            this.y += 4;
        }
    }

    explode() {
        this.spriteAtual = spriteExplosaoInimigo;
        this.destruido.explodiu(this);
    }
}

class Explosao {
    spriteExplosoes = [
        { sx: 13, sy: 14, largura: 15, altura: 15 },
        { sx: 46, sy: 8, largura: 27, altura: 23 },
        { sx: 83, sy: 3, largura: 35, altura: 33 },
        { sx: 121, sy: 0, largura: 38, altura: 38 },
        { sx: 160, sy: 0, largura: 37, altura: 37 },
        { sx: 2, sy: 43, largura: 37, altura: 35 },
        { sx: 44, sy: 45, largura: 34, altura: 32 }
    ];
    tempo_explosao = 50;
    ultimaExplosao = 0;
    escolherExplosao = 0;

    explodiu(instancia) {
        if(Date.now() - this.ultimaExplosao > this.tempo_explosao) {                    
            if(this.escolherExplosao < this.spriteExplosoes.length) {
                console.log(this.escolherExplosao);
                instancia.sx = this.spriteExplosoes[this.escolherExplosao].sx;
                instancia.sy = this.spriteExplosoes[this.escolherExplosao].sy;
                instancia.largura = this.spriteExplosoes[this.escolherExplosao].largura;
                instancia.altura = this.spriteExplosoes[this.escolherExplosao].altura;
                this.escolherExplosao += 1;
                this.ultimaExplosao = Date.now();
            } else {
                if(instancia instanceof Nave) {
                    console.log(this.escolherExplosao);
                    players.shift();
                    console.log("ola");
                } else if (instancia instanceof HelicopteroCinzaEnemie) {
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
        const xAleatorio = gerarNumeroAleatorioInclusivo(53, 347);
        const inimigo = new HelicopteroCinzaEnemie(xAleatorio, -10, numeroInimigo);
        inimigos[numeroInimigo] = inimigo;
        numeroInimigo += 1;
        console.log("novo inimigo adicionado");
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
