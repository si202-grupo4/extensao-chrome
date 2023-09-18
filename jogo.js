const spriteFundo = new Image();
spriteFundo.src = "./fundo.jpg";

const spriteNave = new Image();
spriteNave.src = "./SNES - Strike Gunner STG - Players Ship.png";

const spriteEnemy = new Image(); // Load the same image as the Nave
spriteEnemy.src = "./SNES - Strike Gunner STG - Players Ship.png";

const spriteTiro = new Image();
spriteTiro.src = "./SNES - Strike Gunner STG - Players Ship.png"

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

let estadoTecla = {}

class Enemy {
    constructor(sx, sy, largura, altura, x, y) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.x = x;
        this.y = y;
        this.velocidadeX = 1; // Adjust the enemy's horizontal speed as needed
        this.velocidadeY = 1; // Adjust the enemy's vertical speed as needed
    }

    desenha() {
        contexto.drawImage(
            spriteEnemy,
            this.sx, this.sy,
            this.largura, this.altura,
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    movimento(playerX, playerY) {
        // Move the enemy towards the player
        this.y += this.velocidadeY;


        // You can add more advanced movement logic here based on your game's requirements.
    }
}



class Nave {
    x = 160 - 51 / 2;
    y = 410;
    aceleracao = 0.5;
    velocidadeX = 0;
    velocidadeY = 0;
    velocidadeMax = 6;
    tiro = [];
    intervaloTiro = 100 //Em ms

    constructor(sx, sy, largura, altura) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.tempoUltimoTiro = 0;
    }

    desenha() {
        contexto.drawImage(
            spriteNave,
            this.sx, this.sy,
            this.largura, this.altura,
            //fonte
            this.x, this.y,
            this.largura, this.altura,
        );
    }
        
    movimento(fundo_largura, fundo_altura) {
        if(estadoTecla["d"] || estadoTecla["D"]) {
            if((this.x + this.largura) < fundo_largura) {
                this.velocidadeX += this.aceleracao;
            } else {
                this.velocidadeX = 0;
            }
        }

        if(estadoTecla["a"] || estadoTecla["A"]) {
            if(this.x > 0) {
                this.velocidadeX -= this.aceleracao;
            } else {
                this.velocidadeX = 0;
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
            this.velocidadeX = this.velocidadeMax
        }
        if(this.velocidadeX < -this.velocidadeMax) {
            this.velocidadeX = -this.velocidadeMax
        }
        if(this.velocidadeY > this.velocidadeMax) {
            this.velocidadeY = this.velocidadeMax
        }
        if(this.velocidadeY < -this.velocidadeMax) {
            this.velocidadeY = -this.velocidadeMax
        }
    }

    atirar() {
        if (estadoTecla[" "] && Date.now() - this.tempoUltimoTiro > this.intervaloTiro) {
            this.tiro.push(new TiroNave(114, 48, 14, 6, (this.x + this.largura / 2) - 7, this.y));
            this.tempoUltimoTiro = Date.now();
        }
        for (let i = 0; i < this.tiro.length; i++) {
            this.tiro[i].movimento();
        }
    }
}

class TiroNave {
    velocidadeTiro = 5;

    constructor(sx, sy, largura, altura, x, y) {
        this.sx = sx;
        this.sy = sy;
        this.largura = largura;
        this.altura = altura;
        this.x = x;
        this.y = y;
    }

    desenha() {
        contexto.drawImage(
            spriteTiro,
            this.sx, this.sy,
            this.largura, this.altura,
            //fonte
            this.x, this.y,
            this.largura, this.altura,
        );
    }

    movimento() {
        this.y -= this.velocidadeTiro;
    }
}
            
class PlanoFundo {
    x = 0;
    y = 0;
    largura = canvas.width;
    altura = canvas.height;
    
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
        const movimento = 1;
        const loop = this.altura;
        let movimentacao = this.y + movimento;
        this.y = movimentacao % loop;
    }
}

class Telas {
    constructor(tela) {
        this.tela = tela;
        if(tela == "JOGO") {
            this.fundo = new PlanoFundo();
            this.nave = new Nave(7, 57, 19, 27);
            this.enemies = []; // Create an empty array for enemies
        }
    }

    criarInimigo() {
        // Create enemies and add them to the array
        const enemyX = Math.random() * (canvas.width - 50); // Adjust the range as needed
        const enemyY = -30; // Start enemies above the screen
        const enemy = new Enemy(0, 0, 19, 27, enemyX, enemyY);
        this.enemies.push(enemy);
    }

    desenha() {
        if(this.tela == "JOGO") {
            this.fundo.desenha();
            this.fundo.atualiza();
            this.nave.desenha();

            for(let i = 0; i < this.nave.tiro.length; i++) {
                this.nave.tiro[i].desenha();
            }

            for(let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].desenha();
            }
        }
    }

    atualiza() {
        if(this.tela == "JOGO") {
            this.nave.movimento(this.fundo.largura, this.fundo.altura);
            this.nave.atirar();

            // Update enemy positions and logic
            for(let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].movimento();

                // Remove enemies when they go below the screen
                if(this.enemies[i].y > canvas.height) {
                    this.enemies.splice(i, 1);
                    i--;
                }
            }

            // Create new enemies at intervals
            if (Math.random() < 0.02) {
                this.criarInimigo();
            }

            for (let i = 0; i < this.enemies.length; i++) {
                for (let j = 0; j < this.nave.tiro.length; j++) {
                    const enemy = this.enemies[i];
                    const bullet = this.nave.tiro[j];

                    if (
                        bullet.x < enemy.x + enemy.largura &&
                        bullet.x + bullet.largura > enemy.x &&
                        bullet.y < enemy.y + enemy.altura &&
                        bullet.y + bullet.altura > enemy.y
                    ) {
                        // Collision detected, remove the enemy and the bullet
                        this.enemies.splice(i, 1);
                        this.nave.tiro.splice(j, 1);

                        // Decrease i and j to avoid skipping elements
                        i--;
                        j--;
                    }
                }
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

function runGame() {
    telaAtiva.desenha();
    telaAtiva.atualiza();

    requestAnimationFrame(runGame);
}

runGame();
