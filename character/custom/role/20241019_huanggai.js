import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export default {
    code: "20241019_huanggai",
    name: "甜肉黄盖",
    sex: "male",
    org: "wu",
    hp: 4,
    intro: "黄盖+甜肉",
    image: "huanggai.jpg",
    skills: {
        kurou: {
            name: "苦肉",
            info: "失去1点体力并摸两张牌",
            handle: {
                audio: "kurou1",
                enable: "phaseUse",
                prompt: "失去1点体力并摸两张牌",
                async content(event, trigger, player) {
                    player.loseHp(1);
                    player.draw(2);
                },
                ai: {
                    basic: {
                        order: 1,
                    },
                    result: {
                        player(player) {
                            if (player.countCards("h") >= player.hp - 1) return -1;
                            if (player.hp < 3) return -1;
                            return 1;
                        },
                    },
                },
            }
        },
        tianrou: {
            name: "甜肉",
            info: "弃两张牌并失回复1点体力",
            handle: {
                audio: "jiuyuan2",
                enable: "phaseUse",
                position: "hs",
                viewAs: { name: "tao" },
                filterCard(card, player) {
                    return true
                },
                selectCard: 2,
                complexCard: true,
                check(card) {
                    const player = _status.event.player;
                    const targets = game.filterPlayer(function (current) {
                        return player.canUse("tao", current);
                    });
                    let num = 0;
                    for (let i = 0; i < targets.length; i++) {
                        let eff = get.sgn(get.effect(targets[i], { name: "tao" }, player, player));
                        if (targets[i].hp == 1) {
                            eff *= 1.5;
                        }
                        num += eff;
                    }
                    if (!player.needsToDiscard(-1)) {
                        if (targets.length >= 7) {
                            if (num < 2) return 0;
                        } else if (targets.length >= 5) {
                            if (num < 1.5) return 0;
                        }
                    }
                    return 6 - get.value(card);
                },
                ai: {
                    basic: {
                        order: 8.5,
                    },
                },
            },
        },
    },
    perfectPairs: [],
}