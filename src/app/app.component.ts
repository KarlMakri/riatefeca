import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Category {
  name: string;
}

interface ResponseQuizz {
  result: any;
}

interface ResponseToClientChoice {
  success: boolean;
  answers: any[]
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {

  title = 'LaCantiniere';

  server = 'http://localhost:8080/lunchtime';
  answer = null;
  imgUrl = null;
  categories: Category[] = [];
  url = '';
  category = 0;
  difficulty = 0;
  questions: any = null;
  isQuizzRunning: boolean = false;
  questionIndex: number = 0;
  clientChoice = {
    question_id: null,
    answers: []
  };
  isClientChoiceSent: boolean = false;
  isServerResponseReceived: boolean = false;
  feedback: string = '';
  score: number = 0;
  feedbackColor: string = '#000';
  noResult: boolean = false;
  goodAnswers = null;
  username: string = '';

  constructor(private http: HttpClient) {


  }



  runQuizz() {
    // Charge une collection de questions/réponses en ajax.
    // On interroge une route (endpoint) fournissant les données

    let url: string = this.server + '/question/json';
    url += `?category=${this.category}&difficulty=${this.difficulty}`;

    this.http.get(url)
      .subscribe((res: ResponseQuizz) => {

        if (!res.result) {
          // Aucune question trouvée en rapport avec les filtres
          this.noResult = true;
        } else {
          // le serveur a renvoyé une ou plusieurs questions
          this.noResult = false;
          let questions = [];
          // itération sur les clés de l'objet
          for (let k in res.result) {
            let question = {
              'id': res.result[k].question.id,
              'label': res.result[k].question.label,
              'answers': res.result[k].answers
            };
            questions.push(question);
          } // fin de for

          this.questions = questions;
          this.isQuizzRunning = true;
          this.clientChoice.question_id =
            this.questions[this.questionIndex].id;
        }
      })
  }

  validQuestion() {
    this.isClientChoiceSent = true;
    // requête au serveur pour vérification du choix client
    let url = this.server + '/question/client/check';

    this.http.post(url, this.clientChoice)
      .subscribe((res: ResponseToClientChoice) => {

        if (res.success) {
          // le client a fourni la/les bonne(s) réponse(s)
          this.feedback = 'Bien joué !';
          this.feedbackColor = '#6ee244';
          this.score++;
        } else {
          // le client a échoué
          this.feedback = 'Raté !';
          this.feedbackColor = '#bc0b0b';
        }

        this.goodAnswers = res.answers;
        this.isServerResponseReceived = true;

        // si fin de quizz, envoi au serveur
        // du username/score pour enregistrement
        if (this.questionIndex ===
            this.questions.length - 1) {
              this.sendScore();
            }
      })
  }

  sendScore() {
    let result = this.score / this.questions.length * 100;
    let score = {
      username: this.username,
      result: result
    }
    let url = this.server + '/score';

    this.http.post(url, score)
      .subscribe(res => {
        console.log(res);
      })
  }

  checkAnswer(question_id: number, answer_id: number) {
    let index = this.clientChoice.answers.indexOf(answer_id);
    if (index === -1) {
      // answer_id non trouvé clientChoice.answers
      // => on l'ajoute
      this.clientChoice.answers.push(answer_id);
    } else {
      this.clientChoice.answers.splice(index, 1);
    }
  }

  nextQuestion() {
    this.questionIndex++; // passage à la question suivante
    this.feedback = '';
    this.isClientChoiceSent = false;
    this.isServerResponseReceived = false;
    this.clientChoice.question_id =
      this.questions[this.questionIndex].id;
    this.clientChoice.answers = [];
  }

  restart() {
    this.isQuizzRunning = false;
    this.category = 0;
    this.difficulty = 0;
    this.score = 0;
    this.questionIndex = 0;
    this.feedback = '';
    this.feedbackColor = '#000';
    this.isClientChoiceSent = false;
    this.isServerResponseReceived = false;
    this.clientChoice.answers = [];
    this.goodAnswers = null;
  }

  isCorrect(id: number): boolean {
    if (this.goodAnswers) {
      // parcours des bonnes réponses
      for(let i=0; i<this.goodAnswers.length; i++) {
        if (id == this.goodAnswers[i].id) {
          // l'id de la réponse est trouvé dans le
          // tableau des bonner reposes
          // isCorrect remove true immediateness
          return true;
        }
      }
    } else {
      return false;
    }
  }

}
