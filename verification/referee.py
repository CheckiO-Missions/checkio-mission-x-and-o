"""
CheckiOReferee is a base referee for checking you code.
    arguments:
        tests -- the dict contains tests in the specific structure.
            You can find an example in tests.py.
        cover_code -- is a wrapper for the user function and additional operations before give data
            in the user function. You can use some predefined codes from checkio.referee.cover_codes
        checker -- is replacement for the default checking of an user function result. If given, then
            instead simple "==" will be using the checker function which return tuple with result
            (false or true) and some additional info (some message).
            You can use some predefined codes from checkio.referee.checkers
        add_allowed_modules -- additional module which will be allowed for your task.
        add_close_builtins -- some closed builtin words, as example, if you want, you can close "eval"
        remove_allowed_modules -- close standard library modules, as example "math"

checkio.referee.checkers
    checkers.float_comparison -- Checking function fabric for check result with float numbers.
        Syntax: checkers.float_comparison(digits) -- where "digits" is a quantity of significant
            digits after coma.

checkio.referee.cover_codes
    cover_codes.unwrap_args -- Your "input" from test can be given as a list. if you want unwrap this
        before user function calling, then using this function. For example: if your test's input
        is [2, 2] and you use this cover_code, then user function will be called as checkio(2, 2)
    cover_codes.unwrap_kwargs -- the same as unwrap_kwargs, but unwrap dict.

"""
from random import choice

from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.multicall import CheckiORefereeMulti
from checkio.referees import cover_codes
from checkio.referees import checkers

from tests import TESTS


FIRST = "X"
X = "X"
O = "O"
E = "."
D = "D"
SIZE = 3
EMPTY_FIELD = ("...", "...", "...")

cover = """def cover(f, data):
    return f(tuple(data[0]), data[1])
"""


def random_bot(grid, mark):
    empties = [(x, y) for x in range(SIZE) for y in range(SIZE) if grid[x][y] == E]
    return choice(empties) if empties else (None, None)

FILL_WEIGHT = 2
EMPTY_WEIGHT = 1

def greedy_bot(grid, mark):
    tr_grid = list(zip(*grid))
    empties = [(x, y) for x in range(SIZE) for y in range(SIZE) if grid[x][y] == E]
    if not empties:
        return None, None
    best_cell, best_weight = empties[0], 0
    for x, y in empties:
        rows = [grid[x], tr_grid[y]]
        if x == y:
            rows.append([grid[i][i] for i in range(SIZE)])
        if x == SIZE - y - 1:
            rows.append([grid[i][SIZE - i - 1] for i in range(SIZE)])
        weight = 0
        for work_row in rows:
            weight += sum(FILL_WEIGHT if el == mark else (EMPTY_WEIGHT if el == E else 0)
                          for el in work_row)
        if weight > best_weight:
            best_cell, best_weight = (x, y), weight
        elif weight == best_weight:
            best_cell, best_weight = choice([(x, y), best_cell]), weight
    return best_cell

ALGORITHMS = {
    "random": random_bot,
    "greedy": greedy_bot
}


def check_game(field):
    lines = (["".join(row) for row in field] + ["".join(row) for row in zip(*field)] +
             [''.join(row) for row in zip(*[(r[i], r[2 - i]) for i, r in enumerate(field)])])
    if X * SIZE in lines:
        return X
    elif O * SIZE in lines:
        return O
    elif not any(E in row for row in field):
        return D
    else:
        return E


def initial(data):
    player_mark = data["player_mark"]
    bot_mark = X if player_mark == O else O
    start_field = [list(row) for row in EMPTY_FIELD]
    if data["player_mark"] != FIRST:
        x, y = ALGORITHMS[data["bot"]](EMPTY_FIELD, bot_mark)
        start_field[x][y] = bot_mark
    return {
        "input": [["".join(row) for row in start_field], player_mark],
        "player_mark": player_mark,
        "bot_mark": bot_mark,
        "bot": data["bot"]
    }


def process(data, user):
    if (not isinstance(user, (tuple, list)) or len(user) != 2 or
            not all(isinstance(u, int) and 0 <= u < 3 for u in user)):
        data.update({"result_addon": "The result must be a list/tuple of two integers from 0 to 2.",
                     "result": False,
                     "bot_move": None})
        return data
    grid = list(list(row) for row in data["input"][0])
    if grid[user[0]][user[1]] != E:
        data.update({"result_addon": "You tried to mark the filled cell.",
                     "result": False,
                     "bot_move": None})
        return data
    player_mark = data["player_mark"]
    bot_mark = data["bot_mark"]
    grid[user[0]][user[1]] = data["player_mark"]
    game_result = check_game(grid)
    if game_result == D or game_result == player_mark:
        data.update({"result_addon": "Game ended.",
                     "game_result": game_result,
                     "result": True,
                     "bot_move": None,
                     "grid": grid})
        return data
    bot_move = ALGORITHMS[data["bot"]](grid, bot_mark)
    grid[bot_move[0]][bot_move[1]] = bot_mark
    game_result = check_game(grid)
    if game_result == bot_mark:
        data.update({"result_addon": "Lost :-(",
                     "game_result": game_result,
                     "result": False,
                     "bot_move": bot_move,
                     "grid": grid})
        return data
    elif game_result == D:
        data.update({"result_addon": "Game ended.",
                     "game_result": game_result,
                     "result": True,
                     "bot_move": bot_move,
                     "grid": grid})
        return data
    data.update({"result_addon": "Next move.",
                 "input": [["".join(row) for row in grid], player_mark],
                 "game_result": game_result,
                 "result": True,
                 "bot_move": bot_move,
                 "grid": grid})
    return data


def is_win(data):
    return data["game_result"] == data["player_mark"] or data["game_result"] == D


api.add_listener(
    ON_CONNECT,
    CheckiORefereeMulti(
        tests=TESTS,
        cover_code={
            'python-27': cover,
            'python-3': cover
        },
        initial_referee=initial,
        process_referee=process,
        is_win_referee=is_win,
        function_name="x_and_o"
        # checker=None,  # checkers.float.comparison(2)
        # add_allowed_modules=[],
        # add_close_builtins=[],
        # remove_allowed_modules=[]
    ).on_ready)
