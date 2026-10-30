# 우사기랩 · Usagi Lab

우사기의 소리로 코딩하는 작은 실험실. 우사기랭 v0.2와 `뿌릿` 곱셈 확장을 지원하는 인터프리터, CLI, 웹 플레이그라운드를 담고 있습니다. 숫자와 변수, 문자 출력, 조건문과 명령 이동을 지원하며 CLI와 웹이 같은 TypeScript 코어를 사용합니다.

## 시작하기

Node.js 26 LTS를 사용합니다. 이 저장소는 `.nvmrc`에 Node.js 26.13.0을 고정하며 npm 12.2.1을 기준으로 검증했습니다. 예를 들어 nvm을 사용한다면 `nvm install`과 `nvm use`로 지정된 Node 버전을 활성화할 수 있습니다. 클라우드 환경에서는 `export PATH="/workspace/.tools/node-v26.13.0/bin:$PATH"`로 설치된 버전을 활성화하세요. `.npmrc`는 지원하지 않는 Node 버전에서 의존성 설치를 막습니다.

```sh
npm ci
npm run build
npm test
npm run dev
```

개발 서버 주소는 명령 실행 후 터미널에 표시됩니다. 플레이그라운드에서 예제를 선택하거나 코드를 편집하고 **코드 실행하기**를 누르세요. Ctrl/⌘ + Enter로도 실행할 수 있습니다. 실행 결과와 변수 보관함을 확인할 수 있습니다.

## CLI

빌드 후 다음과 같이 실행합니다.

```sh
npm run usa -- run examples/rap.usa
npm run usa -- run examples/countdown.usa
# 또는 node dist/cli/index.js run examples/rap.usa
```

패키지를 로컬 또는 전역으로 설치하면 `usa run 파일.usa` 명령을 사용할 수 있습니다. 실행 오류는 표준 오류에 행과 열을 표시하고 0이 아닌 종료 코드를 반환합니다. `푸루루!`의 문자 출력은 개행하지 않으며 빈 수식의 `푸루루!`는 개행합니다.

## 언어 맛보기

```text
야하!
우 이이이히          # 1번 변수에 3 저장
우라! 라            # 3 출력
이야아하아! 이히히 야하 이이히  # 4 출력
우라라!
```

`야하`는 +1이지만 `야 하`는 +1과 −1의 합인 0입니다. 자세한 토큰, 명령, 번호 매기기와 오류 규칙은 [언어 명세](docs/SPEC.md)를 확인하세요. `examples/`에는 랩, 카운트다운, 문자 출력 예제가 있습니다.

`뿌릿`은 양쪽 구간의 합을 곱합니다. 예를 들어 `야야야 뿌릿 이이히`는 `(1 + 1 + 1) × 2`인 6이고, `이이히 뿌릿 이이이히 하`는 `2 × (3 − 1)`인 4입니다. 각 구간의 합을 먼저 구하는 점에 주의하세요.

## 라이브러리로 사용하기

빌드된 코어에서 `run`, `parse`, `lex`, `UsagiError`를 가져올 수 있습니다.

```ts
import { run } from './dist/index.js';

const result = run('야하!\n우라! 야하\n우라라!', { maxSteps: 100_000 });
console.log(result.output); // '1\n'
console.log(result.variables, result.stepCount);
```

`run`은 호출마다 새 변수와 출력을 사용합니다. 실행 오류의 `state`에는 오류까지의 부분 출력과 변수 상태가 담깁니다.

## GitHub Pages 배포

GitHub 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다. `main`에 변경 사항을 올리면 `.github/workflows/pages.yml`이 테스트와 빌드를 수행하고 사이트를 배포합니다. workflow를 수동으로 실행할 수도 있습니다. Pages는 공개 웹사이트이므로 저장소와 사이트의 공개 범위를 확인하세요. 배포 주소는 Actions의 배포 작업과 Pages 설정에서 확인할 수 있습니다.
