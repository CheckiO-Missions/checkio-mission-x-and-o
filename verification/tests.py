"""
TESTS is a dict with all you tests.
Keys for this will be categories' names.
Each test is dict with
    "input" -- input data for user function
    "answer" -- your right answer
    "explanation" -- not necessary key, it's using for additional info in animation.
"""

TESTS = {
    "0. Random X":
        {
            "player_mark": "X",
            "bot": "random"
        },
    "1. Random O":
        {
            "player_mark": "O",
            "bot": "random"
        },
    "2. Random X":
        {
            "player_mark": "X",
            "bot": "random"
        },
    "3. Random O":
        {
            "player_mark": "O",
            "bot": "random"
        },
    "4. Greedy X":
        {
            "player_mark": "X",
            "bot": "greedy"
        },
    "5. Greedy O":
        {
            "player_mark": "O",
            "bot": "greedy"
        },
    "6. Against X":
        {
            "player_mark": "X",
            "bot": "against"
        },
    "7. Against O":
        {
            "player_mark": "O",
            "bot": "against"
        },

}
