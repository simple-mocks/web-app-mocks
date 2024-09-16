package com.github.simplemocks.web.app.mocks.controller;

import com.github.simplemocks.web.app.mocks.api.rq.CreateMockRq;
import com.github.simplemocks.web.app.mocks.api.rq.GetMockRq;
import com.github.simplemocks.web.app.mocks.api.rq.UpdateMockRq;
import com.github.simplemocks.web.app.mocks.api.rs.CreateMockRs;
import com.github.simplemocks.web.app.mocks.api.rs.GetMockRs;
import com.github.simplemocks.web.app.mocks.api.rs.UpdateMockRs;
import com.github.simplemocks.web.app.mocks.service.WebAppMocksService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;

@Slf4j
@RestController
@RequestMapping(
        path = "${web.app.mocks.uri.rest.mocks.path}",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
)
public class WebAppMocksRestController {
    private static final Base64.Decoder B64_DECODER = Base64.getDecoder();

    private final WebAppMocksService webAppMocksService;

    @Autowired
    public WebAppMocksRestController(WebAppMocksService webAppMocksService) {
        this.webAppMocksService = webAppMocksService;
    }

    @PostMapping("/v1/create")
    public CreateMockRs create(@RequestBody CreateMockRq rq) {
        var content = rq.getContent();
        var httpMockEntity = webAppMocksService.create(
                rq.getServiceId(),
                rq.getMethod(),
                rq.getAntPattern(),
                rq.getType(),
                rq.getMeta(),
                B64_DECODER.decode(content)
        );
        return new CreateMockRs(httpMockEntity.getId());
    }

    @PostMapping("/v1/update")
    public UpdateMockRs update(@RequestBody UpdateMockRq rq) {
        var content = rq.getContent();
        var httpMockEntity = webAppMocksService.update(rq.getMockId(),
                rq.getMethod(),
                rq.getAntPattern(),
                rq.getType(),
                rq.getMeta(),
                B64_DECODER.decode(content));
        return new UpdateMockRs(httpMockEntity.getId());
    }

    @PostMapping("/v1/get")
    public GetMockRs get(@RequestBody GetMockRq rq) {
        var mockDto = webAppMocksService.get(rq.getMockId());
        return new GetMockRs(mockDto);
    }

}
