package com.novoda.pianohero;

public class GameModel implements GameMvp.Model {

    private final SongSequenceFactory songSequenceFactory;
    private final Piano piano;
    private final PlayAttemptGrader playAttemptGrader;
    private final Clickable startGameClickable;
    private final ViewModelConverter converter;
    private final GameTimer gameTimer;

    private State gameState = State.empty();
    private GameCallback gameCallback;

    GameModel(
            SongSequenceFactory songSequenceFactory,
            Piano piano,
            Clickable startGameClickable,
            GameTimer gameTimer,
            ViewModelConverter converter,
            PlayAttemptGrader playAttemptGrader
    ) {
        this.songSequenceFactory = songSequenceFactory;
        this.piano = piano;
        this.startGameClickable = startGameClickable;
        this.gameTimer = gameTimer;
        this.converter = converter;
        this.playAttemptGrader = playAttemptGrader;
    }

    @Override
    public void startGame(GameCallback gameCallback) {
        this.gameCallback = gameCallback;

        startGameClickable.setListener(new Clickable.Listener() {
            @Override
            public void onClick() {
                startNewGame();
            }
        });

        piano.attachListener(onNotePlayedListener);
        startNewGame();
    }

    private final Piano.NoteListener onNotePlayedListener = new Piano.NoteListener() {

        @Override
        public void onStart(Note note) {
            if (gameTimer.gameHasEnded()) {
                return;
            }

            gameState = gameState.update(Sound.of(note))
                    .update(gameTimer.secondsRemaining())
                    .update(Message.empty());

            GameInProgressViewModel gameInProgressViewModel = converter.createGameInProgressViewModel(gameState);
            gameCallback.onGameProgressing(gameInProgressViewModel);
        }

        @Override
        public void onStop(Note note) {
            if (gameTimer.gameHasEnded()) {
                return;
            }

            playAttemptGrader.grade(note, gameState.getSequence(), onPlayAttemptGradedCallback);
        }

        private final PlayAttemptGrader.Callback onPlayAttemptGradedCallback = new PlayAttemptGrader.Callback() {
            @Override
            public void onCorrectNotePlayed(Sequence sequence) {
                gameState = gameState.update(gameState.getScore().increment())
                        .update(sequence)
                        .update(Sound.ofSilence())
                        .update(gameTimer.secondsRemaining())
                        .update(getSuccessMessage(sequence));

                GameInProgressViewModel gameInProgressViewModel = converter.createGameInProgressViewModel(gameState);
                gameCallback.onGameProgressing(gameInProgressViewModel);
            }

            private Message getSuccessMessage(Sequence sequence) {
                if (sequence.position() > 0) {
                    return new Message("Fantastic, keep going!");
                } else {
                    return Message.empty();
                }
            }

            @Override
            public void onIncorrectNotePlayed(Sequence sequence) {
                gameState = gameState.update(gameState.getScore().decrement())
                        .update(sequence)
                        .update(Sound.ofSilence())
                        .update(gameTimer.secondsRemaining())
                        .update(new Message("Uh-oh, try again!"));

                GameInProgressViewModel gameInProgressViewModel = converter.createGameInProgressViewModel(gameState);
                gameCallback.onGameProgressing(gameInProgressViewModel);
            }

            @Override
            public void onFinalNoteInSequencePlayedSuccessfully() {
                Sequence sequence = songSequenceFactory.maryHadALittleLamb(); // TODO: pick next song in playlist
                gameState = gameState.update(sequence)
                        .update(gameState.getScore().increment())
                        .update(Sound.ofSilence())
                        .update(new Message("Excellent, next song!"));

                GameInProgressViewModel gameInProgressViewModel = converter.createGameInProgressViewModel(gameState);
                gameCallback.onGameProgressing(gameInProgressViewModel);
            }
        };
    };

    private void startNewGame() {
        if (gameCallback == null) {
            throw new IllegalStateException("how you startin' a new game without calling startGame(GameCallback)");
        }
        emitInitialGameState(gameCallback);
        gameTimer.start(gameTimerCallback);
    }

    private final GameTimer.Callback gameTimerCallback = new GameTimer.Callback() {
        @Override
        public void onSecondTick(long secondsUntilFinished) {
            gameState = gameState.update(secondsUntilFinished);

            GameInProgressViewModel viewModel = converter.createGameInProgressViewModel(gameState);
            gameCallback.onGameProgressing(viewModel);
        }

        @Override
        public void onFinish() {
            gameCallback.onGameComplete(converter.createGameOverViewModel(gameState));
        }
    };

    private void emitInitialGameState(GameCallback gameCallback) {
        Sequence sequence = songSequenceFactory.maryHadALittleLamb();
        gameState = State.initial(sequence);

        GameInProgressViewModel viewModel = converter.createGameInProgressViewModel(gameState);
        gameCallback.onGameProgressing(viewModel);
    }

    @Override
    public void stopGame() {
        gameTimer.stop();
    }
}
