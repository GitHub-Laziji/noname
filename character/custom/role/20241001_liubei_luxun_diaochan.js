import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export default {
    code: "20241001_liubei_luxun_diaochan",
    name: "渣渣备",
    sex: "male",
    org: "shu",
    hp: 4,
    intro: "刘备+陆逊+闭月蝉",
    image: "liubei.jpg",
    skills: {
        fangjian: {
            name: "仁德",
            info: "发牌。",
            handle: {
                audio: "rende",
                enable: "phaseUse",
                filterCard: true,
                selectCard: [1, Infinity],
                discard: false,
                lose: false,
                delay: 0,
                filterTarget(card, player, target) {
                    return player != target;
                },
                check(card) {
                    if (ui.selected.cards.length > 1) return 0;
                    if (ui.selected.cards.length && ui.selected.cards[0].name == "du") return 0;
                    if (!ui.selected.cards.length && card.name == "du") return 20;
                    const player = get.owner(card);
                    let num = 0;
                    const evt2 = _status.event.getParent();
                    player.getHistory("lose", evt => {
                        if (evt.getParent().skill == "rende" && evt.getParent(3) == evt2) num += evt.cards.length;
                    });
                    if (player.hp == player.maxHp || num > 1 || player.countCards("h") <= 1) {
                        if (ui.selected.cards.length) {
                            return -1;
                        }
                        const players = game.filterPlayer();
                        for (let i = 0; i < players.length; i++) {
                            if (players[i].hasSkill("haoshi") && !players[i].isTurnedOver() && !players[i].hasJudge("lebu") && get.attitude(player, players[i]) >= 3 && get.attitude(players[i], player) >= 3) {
                                return 11 - get.value(card);
                            }
                        }
                        if (player.countCards("h") > player.hp) return 10 - get.value(card);
                        if (player.countCards("h") > 2) return 6 - get.value(card);
                        return -1;
                    }
                    return 10 - get.value(card);
                },
                async content(event, trigger, player) {
                    const evt2 = event.getParent(3);
                    let num = 0;
                    player.getHistory("lose", evt => {
                        if (evt.getParent(2).name == "rende" && evt.getParent(5) == evt2) num += evt.cards.length;
                    });
                    player.give(event.cards, event.target);
                    if (num < 2 && num + event.cards.length > 1) player.recover();
                },
                ai: {
                    order(skill, player) {
                        if (player.hp < player.maxHp && player.storage.rende < 2 && player.countCards("h") > 1) {
                            return 10;
                        }
                        return 1;
                    },
                    result: {
                        target(player, target) {
                            if (target.hasSkillTag("nogain")) return 0;
                            if (ui.selected.cards.length && ui.selected.cards[0].name == "du") {
                                return target.hasSkillTag("nodu") ? 0 : -10;
                            }
                            if (target.hasJudge("lebu")) return 0;
                            const nh = target.countCards("h");
                            const np = player.countCards("h");
                            if (player.hp == player.maxHp || player.storage.rende < 0 || player.countCards("h") <= 1) {
                                if (nh >= np - 1 && np <= player.hp && !target.hasSkill("haoshi")) return 0;
                            }
                            return Math.max(1, 5 - nh);
                        },
                    },
                    effect: {
                        target_use(card, player, target) {
                            if (player == target && get.type(card) == "equip") {
                                if (player.countCards("e", { subtype: get.subtype(card) })) {
                                    const players = game.filterPlayer();
                                    for (let i = 0; i < players.length; i++) {
                                        if (players[i] != player && get.attitude(player, players[i]) > 0) {
                                            return 0;
                                        }
                                    }
                                }
                            }
                        },
                    },
                    threaten: 0.8,
                },
            }
        },
        lianying: {
            name: "连营",
            info: "拿牌。",
            handle: {
                audio: "lianying",
                trigger: {
                    player: "loseAfter",
                    global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
                },
                frequent: true,
                filter(event, player) {
                    if (player.countCards("h")) return false;
                    const evt = event.getl(player);
                    return evt && evt.player == player && evt.hs && evt.hs.length > 0;
                },
                async content(event, trigger, player) {
                    player.draw();
                },
                ai: {
                    threaten: 0.8,
                    effect: {
                        player_use(card, player, target) {
                            if (player.countCards("h") === 1) return [1, 0.8];
                        },
                        target(card, player, target) {
                            if (get.tag(card, "loseCard") && target.countCards("h") === 1) return 0.5;
                        },
                    },
                    noh: true,
                    skillTagFilter(player, tag) {
                        if (tag == "noh") {
                            if (player.countCards("h") != 1) return false;
                        }
                    },
                },
            }
        },
        lihun: {
            name: "离魂",
            info: "拿牌。",
            handle: {
                audio: "lihun1",
                enable: "phaseUse",
                usable: 1,
                filterTarget: function (card, player, target) {
                    return player != target && target.hasSex("male");
                },
                filterCard: true,
                position: "he",
                content: function () {
                    player.gainPlayerCard(target, true, "h", target.countCards("h"));
                    player.turnOver();
                    // player.addSkill("lihun2");
                    player.storage.lihun = target;
                },
                check: function (card) {
                    return 8 - get.value(card);
                },
                ai: {
                    order: 10,
                    result: {
                        player: function (player) {
                            if (player.classList.contains("turnedover")) return 10;
                            return 0;
                        },
                        target: function (player, target) {
                            if (target.countCards("h") > target.hp) return target.hp - target.countCards("h");
                            return 0;
                        },
                    },
                    threaten: 1.5,
                },
            }
        },
        // lihun2: {
        //     name: "连营",
        //     info: "拿牌。",
        //     handle: {
        //         trigger: { player: "phaseUseEnd" },
        //         forced: true,
        //         popup: false,
        //         audio: false,
        //         content: function () {
        //             "step 0";
        //             var cards = player.getCards("he");
        //             player.removeSkill("lihun2");
        //             if (player.storage.lihun.classList.contains("dead") || player.storage.lihun.hp <= 0 || cards.length == 0) {
        //                 event.finish();
        //             } else {
        //                 if (cards.length < player.storage.lihun.hp) event._result = { bool: true, cards: cards };
        //                 else player.chooseCard("he", true, player.storage.lihun.hp, "离魂：选择要交给" + get.translation(player.storage.lihun) + "的牌");
        //             }
        //             "step 1";
        //             player.give(result.cards, player.storage.lihun);
        //         },
        //     },
        // }
    },
    perfectPairs: [],
}