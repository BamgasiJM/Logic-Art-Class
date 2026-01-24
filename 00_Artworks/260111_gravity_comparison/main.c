#include <stdio.h>
#include <string.h>
#include <math.h>

// 데이터 구조체 정의: 천체 이름과 중력 가속도를 저장합니다.
typedef struct
{
    const char *name;
    double gravity;
} CelestialBody;

// 초기 시뮬레이션 상수 설정
#define INITIAL_VELOCITY 20.0 // 초기 속도 (m/s)
#define TIME_STEP 0.01        // 시간 간격 (s)

/**
 * @brief 중력 가속도 시뮬레이션을 수행하고 결과를 CSV 파일로 저장합니다.
 * * @param v0 초기 속도 (m/s)
 * @param dt 시간 간격 (s)
 * @param g 중력 가속도 (m/s^2)
 * @param filename 출력 파일 이름
 */
void run_simulation(double v0, double dt, double g, const char *filename)
{
    FILE *fp = fopen(filename, "w");
    if (fp == NULL)
    {
        // 파일 생성 오류 처리
        fprintf(stderr, "Error: Could not open file %s\n", filename);
        return;
    }

    // CSV 헤더 작성 (시간, 위치)
    fprintf(fp, "Time (s),Position (m)\n");

    double t = 0.0;
    double y_initial = 0.0;
    double y = 0.0;

    // 시뮬레이션 루프
    // 물체가 다시 땅(y=0)으로 돌아올 때까지 계산을 수행합니다.
    while (1)
    {
        // 위치 계산 공식: y(t) = y_initial + v0 * t - 0.5 * g * t^2
        y = y_initial + v0 * t - 0.5 * g * t * t;

        // 물체가 땅에 닿거나 땅 아래로 내려가려고 하면 (시뮬레이션 종료 조건)
        if (y < 0.0)
        {
            // 이전에 땅을 뚫고 내려갔으므로, 마지막 위치를 0으로 설정하고 종료합니다.
            y = 0.0;
            fprintf(fp, "%.6f,%.6f\n", t, y);
            break;
        }

        // CSV에 데이터 작성 (시간, 위치)
        fprintf(fp, "%.6f,%.6f\n", t, y);

        // 다음 시간 단계로 이동
        t += dt;

        // 최대 비행 시간 (2 * v0 / g)의 2배를 넘어가면 안전을 위해 루프를 종료합니다.
        // 태양의 경우 비행 시간이 매우 짧기 때문에 이 조건이 과도하게 느린 루프를 방지합니다.
        if (t > (2.0 * v0 / g) + 1.0)
        {
            break;
        }
    }

    fclose(fp);
    printf("-> Simulation results for %s (G=%.2f) saved to %s\n",
           filename, g, filename);
}

int main()
{
    // 시뮬레이션할 천체 목록 정의
    CelestialBody bodies[] = {
        {"Earth", 9.80665},
        {"Moon", 1.62},
        {"Mars", 3.71},
        {"Jupiter", 24.79},
        {"Neptune", 11.15},
        {"Sun", 274.0}};
    int num_bodies = sizeof(bodies) / sizeof(bodies[0]);
    char filename_buffer[256];

    printf("Starting Gravity Simulation for %d bodies (V0=%.1fm/s, dT=%.2fs):\n",
           num_bodies, INITIAL_VELOCITY, TIME_STEP);
    printf("------------------------------------------------------------------\n");

    // 모든 천체에 대해 시뮬레이션 반복 실행
    for (int i = 0; i < num_bodies; i++)
    {

        // 파일 이름 생성 (예: Earth_data.csv)
        // snprintf는 문자열 버퍼 오버플로우를 방지하는 안전한 함수입니다.
        snprintf(filename_buffer, sizeof(filename_buffer), "%s_data.csv", bodies[i].name);

        // 시뮬레이션 실행 및 파일 저장
        run_simulation(INITIAL_VELOCITY, TIME_STEP, bodies[i].gravity, filename_buffer);
    }

    printf("------------------------------------------------------------------\n");
    printf("All simulations completed successfully. Check the generated CSV files.\n");

    return 0;
}